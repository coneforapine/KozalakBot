const assert = require('assert');
const { inspect } = require('util');
const now = require('performance-now');
const { MessageAttachment } = require('discord.js');
const { Command } = require('klasa');
const { util } = require('util');

module.exports = class extends Command {
  constructor (...args) {
    super(...args, {
      aliases: ['ev'],
      permLevel: 10,
      description: 'Evaluates arbitrary JavaScript. Reserved for bot owner.',
      usage: '<expression:str>',
      extendedHelp: `Flags:
-d, --delete
        delete the command message
--inspect=DEPTH
        the number of times to recurse while formatting the result; default 0
-l, --log
        send the result to the console instead of Discord; cannot be combined with -s (overridden by -o)
-p, --no-await
        don't await the result if it's a promise
-o, --output-to=[WHERE]
        output the result to WHERE; WHERE can be 'channel' (default), 'log' (-l), 'upload', or 'none' / '' (-s); if provided, -l and -s are ignored
-s, --silent
        eval the code without showing the result; cannot be combined with -l (overridden by -o)
-w, --wait=TIME
        time in milliseconds to await promises; default is 10000`
    });

    this.defaults = {
      // The depth to inspect the evaled output to, if it's not a string
      inspectionDepth: 0,
      // How long to wait for promises to resolve
      wait: 10000
    };

    // The depth to get the types of nested data structures, recursively
    this.typeDepth = 2;
    // The number of lines before the output is considered overly long
    this.tooManyLines = 7;
    // The approx. number of chars per line in a codeblock on Android, on a Google Pixel XL
    this.mobileCharsPerLine = 34;

    // How the evaled result is outputted
    this.outputTo = {
      /**
       * @param {DiscordMessage} msg The command message
       * @param {string} evaled The evaled output (as a string).
       * @param {string} topLine The line with the type and time info.
       * @returns {Promise<DiscordMessage>}
       */
      channel: (msg, evaled, topLine) => msg.send(`\`${topLine}\`\n${this.client.methods.util.codeBlock('js', this.client.methods.util.clean(evaled))}`),
      /**
       * @param {DiscordMessage} msg The command message
       * @param {string} evaled The evaled output (as a string).
       * @param {string} topLine The line with the type and time info.
       * @returns {Promise<boolean>}
       */
      log: async (msg, evaled, topLine) => this.client.emit('log', `${topLine}\n${evaled}`),
      /**
       * @param {DiscordMessage} msg The command message
       * @param {string} evaled The evaled output (as a string).
       * @param {string} topLine The line with the type and time info.
       * @returns {Promise<DiscordMessage>}
       */
      upload: (msg, evaled, topLine) => msg.channel.send(`\`${topLine}\``, new MessageAttachment(Buffer.from(`// ${topLine}\n${evaled}`), 'eval.js')),
      /**
       * @returns {Promise<null>}
       */
      none: async () => null
    };
  }

  /**
   * @typedef Flags
   * @property {boolean} delete
   * @property {number} inspectionDepth
   * @property {boolean} noAwait
   * @property {string} outputTo
   * @property {number} wait
   */

  /**
   * Run the eval command
   * @param {DiscordMessage} msg The command message
   * @param {Array<string>} args The args passed to the command
   * @returns {?Promise<DiscordMessage>}
   */
  async run (msg, [argStr]) {
    const { givenFlags, code } = this.parseArgs(argStr);

    /** @type {Flags} */
    const flags = {
      delete: Boolean(givenFlags.delete || givenFlags.d),
      inspectionDepth: parseInt(givenFlags.inspect || this.defaults.inspectionDepth, 10),
      noAwait: Boolean(givenFlags['no-await'] || givenFlags.p),
      outputTo: [givenFlags['output-to'], givenFlags.o].find(f => f in this.outputTo) ||
        (givenFlags.log || givenFlags.l ? 'log' : '') ||
        (givenFlags.silent || givenFlags.s ? 'none' : '') ||
        'channel',
      wait: parseInt(givenFlags.wait || givenFlags.w || this.defaults.wait, 10)
    };

    if (flags.delete) msg.delete();

    try {
      const { evaled, topLine } = await this.handleEval(flags, code, /* for the eval: */ msg);

      if (flags.outputTo === 'log') return this.outputTo.log(msg, evaled, topLine);
      if (flags.outputTo === 'upload') return this.outputTo.upload(msg, evaled, topLine);

      if (this.isTooLong(evaled, topLine)) {
        return this.sendTooLongQuery(msg, evaled, topLine,
          'Output is too long. Log it to console instead? Or `truncate` it or `upload` it as a file?',
          { yes: 'log' });
      }

      const is = this.isKindaLong(evaled);
      if (is.kindaLong) {
        return this.sendTooLongQuery(msg, evaled, topLine,
          is.becauseOfWrapping ?
            `The output is long (${is.lineCount} lines, plus wrapping on small screens). Send it anyway? Or \`truncate\` it and send it, or \`log\` it to console, or \`upload\` it as a file.` :
            `The output is long (${is.lineCount} lines). Send it anyway? Or \`truncate\` it and send it, or \`log\` it to console, or \`upload\` it as a file.`,
          { yes: 'channel' });
      }

      return this.outputTo.channel(msg, evaled, topLine);
    } catch (error) {
      if (flags.outputTo === 'none') return null;
      if (error && error.stack) this.client.emit('error', error.stack);
      if (flags.outputTo === 'log') return null;
      return msg.send(`\`ERROR\`\n${this.client.methods.util.codeBlock('js', this.client.methods.util.clean(error))}`);
    }
  }

  /**
   * Parse the command arguments
   * @param {string} argStr The arguments passed to the command
   * @returns {{givenFlags: Object<string, string>, code: string}}
   */
  parseArgs (argStr) {
    const flagRegex = /^(--?)([a-z-]+)(=[a-z\d]*)?$/;
    const args = String(argStr).split(' ');
    const codeIndex = args.findIndex((arg, i) => !flagRegex.test(arg) || arg === '--code');
    const argFlags = args.slice(0, codeIndex);
    const givenFlags = {};
    for (let argIndex = 0; argIndex < argFlags.length; argIndex++) {
      const [, hyphen, flagName, value] = flagRegex.exec(argFlags[argIndex]);
      if (hyphen === '-') {
        for (let i = 0; i < flagName.length; i++) givenFlags[flagName[i]] = value ? value.slice(1) : true;
      } else if (hyphen === '--') givenFlags[flagName] = value ? value.slice(1) : true;
      else assert(false, 'Something has gone horribly wrong if this runs');
    }

    return {
      givenFlags,
      code: args.slice(args[codeIndex] === '--code' && codeIndex + 1 < args.length ?
        codeIndex + 1 :
        codeIndex).join(' ')
    };
  }

  /**
   * Eval the code and get info on the type of the result
   * @param {Flags} flags The flags the command was called with
   * @param {string} code The code obvs
   * @param {DiscordMessage} msg The message, so it's available to the eval
   * @returns {{evaled: string, topLine: string}}
   */
  async handleEval (flags, code, /* for the eval: */ msg) {
    const start = now();
    const evaledOriginal = eval(code); // eslint-disable-line no-eval
    const syncEnd = now();
    const evaledTimeout = util.timeoutPromise(evaledOriginal, flags.wait);
    // Awaiting a non-promise returns the non-promise
    let evaledValue = flags.noAwait ? evaledOriginal : await evaledTimeout;
    const asyncEnd = now();

    const evaledIsThenable = util.isThenable(evaledOriginal);

    // We're doing this checking here so it's not counted in the performance-now timeing
    // And if the promise timed out, just show the promise
    if (!evaledIsThenable || evaledValue instanceof util.TimeoutError) evaledValue = evaledOriginal;

    const time = evaledIsThenable && !flags.noAwait ?
      `⏱${util.getNiceDuration(syncEnd - start)}<${util.getNiceDuration(asyncEnd - syncEnd)}>` :
      `⏱${util.getNiceDuration(syncEnd - start)}`;

    if (flags.outputTo === 'none') return { evaled: evaledValue };

    const topLine = `${await this.getTypeStr(
      flags,
      evaledOriginal,
      evaledIsThenable ? evaledTimeout : null
    )} ${time}`;

    if (typeof evaledValue !== 'string') evaledValue = inspect(evaledValue, { depth: flags.inspectionDepth });

    return { evaled: evaledValue, topLine };
  }

  /**
   * Checks if the output will be more than 2,000 characters
   * @param {string} evaled The evaled output (as a string)
   * @param {string} topLine The line with the type and time info
   * @returns {boolean}
   */
  isTooLong (evaled, topLine) {
    // 1988 is 2000 - 12 (the chars that are added, "`...`\n```js\n...```")
    return evaled.length > 1988 - topLine.length;
  }

  /**
   * Checks if the output will be...kinda long
   * @param {string} evaled The evaled output (as a string)
   * @returns {{lineCount: number, kindaLong: boolean, becauseOfWrapping: boolean}}
   */
  isKindaLong (evaled) {
    const lines = String(evaled).split('\n');
    const lineCount = lines.length;

    if (lineCount < this.tooManyLines) {
      // It's not long in line-length alone, but what if we take line wrapping into account on small screens?
      const lineCountWithWrapping = lines.reduce(
        // The line length is divided by this.mobileCharsPerLine, rounded up, to see about how many lines
        // it will be on mobile screens.
        (count, line) => count + Math.ceil(line.length / this.mobileCharsPerLine),
        // We have to start with a `count` of 0 for the function to work.
        0
      );
      return {
        lineCount: lineCountWithWrapping,
        kindaLong: lineCountWithWrapping >= this.tooManyLines,
        becauseOfWrapping: true
      };
    }

    return {
      lineCount,
      kindaLong: lineCount >= this.tooManyLines,
      becauseOfWrapping: false
    };
  }

  /**
   * Get the type string of the evaled result
   * @param {Flags} flags The flags the command was called with
   * @param {*} value The value to get the type string for
   * @param {?Promise} [awaitedPromise] The promise that was already `await`ed earlier; this also acts
   *  as a surrogate, so that if the original promise was wrapped in a timeout promise, the original
   *  promise can be examined, while the already-awaited surrogate is awaited
   * @param {number} [i=0] Just an iteration count to prevent infinite loops
   * @returns {string}
   */
  async getTypeStr (flags, value, awaitedPromise = null, i = 0) {
    if (value instanceof util.TimeoutError) return '?';

    const { basicType, type } = util.getComplexType(value);
    if (basicType === 'object') {
      if (util.isThenable(value)) {
        return i <= this.typeDepth && !flags.noAwait ?
          // But we're gonna await the already-awaited promise, for efficiency
          `${type}<${await this.getTypeStr(flags, await awaitedPromise, null, i + 1)}>` :
          `${type}<?>`;
      }
      if (Array.isArray(value)) return `${type}${util.getArrayType(value, this.typeDepth)}`;
      if (value instanceof Map) return `${type}${util.getMapType(value, this.typeDepth)}`;
      if (value instanceof Set) return `${type}${util.getSetType(value, this.typeDepth)}`;
      return `${type}${util.getObjectType(value, this.typeDepth)}`;
    }
    if (basicType === 'function') return `${type}${util.getFunctionType(value, this.typeDepth)}`;
    return type;
  }

  /**
   * Ask the user what to do, when the output is too long to send to a Discord channel
   * @param {DiscordMessage} cmdMsg The command message
   * @param {string} evaled The evaled value (as a string)
   * @param {string} topLine The line with the type and time
   * @param {string} question The question to ask the user
   * @param {{yes: string}} options Options for the query
   * @returns {?Promise<DiscordMessage>}
   */
  async sendTooLongQuery (cmdMsg, evaled, topLine, question, options) {
    const queryMsg = await cmdMsg.channel.send(`${question} (10s til auto-cancel)`);
    try {
      const collected = await cmdMsg.channel.awaitMessages(
        m => m.author.id === cmdMsg.author.id,
        { max: 1, time: 10000, errors: ['time'] }
      );
      const m = collected.first();
      queryMsg.delete();
      m.delete();

      const text = m.content.toLowerCase();
      if (text.startsWith('y')) { // whatever the yes option says to do
        return this.outputTo[options.yes](queryMsg, evaled, topLine);
      } else if (text.startsWith('l')) { // log to console
        return this.outputTo.log(queryMsg, evaled, topLine);
      } else if (text.startsWith('u')) { // upload as a file attachment and send to channel
        return this.outputTo.upload(queryMsg, evaled, topLine);
      } else if (text.startsWith('t')) { // truncate and send to channel
        // Truncate the evaled output, both its # of lines and each line's length
        const evaledLines = evaled.split('\n');
        const newLength = this.tooManyLines - 1;
        const lastIndex = newLength - 1;
        for (let i = 0; i < evaledLines.length; i++) {
          const line = evaledLines[i];
          if (i >= newLength) delete evaledLines[i];
          else if (i === lastIndex) evaledLines[i] = '...';
          else if (line.length > this.mobileCharsPerLine) evaledLines[i] = `${line.substr(0, this.mobileCharsPerLine - 3)}...`;
        }
        return this.outputTo.channel(queryMsg, evaledLines.join('\n'), topLine);
      }
    } catch (error) {
      queryMsg.delete();
    }
    return null;
  }
};
