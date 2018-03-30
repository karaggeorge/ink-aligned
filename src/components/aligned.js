const stream = require('stream');
const {h, Component, render} = require('ink');
const PropTypes = require('prop-types');
const stringWidth = require('string-width');
const _ = require('lodash');

const callTree = require('ink/lib/call-tree');
const {getInstance} = require('ink/lib/instance');

// Thanks to @chalk - https://github.com/chalk/ansi-regex/blob/master/index.js
const stripAnsi = s => s.replace(new RegExp('\\u001B[[\\]()#;?\\d]*[A-Z]', 'g'), '');

class AlignedStream extends stream.Writable {
  constructor(cb) {
    super();
    this.cb = cb;
  }

  _write(chunk, enc, next) {
    this.cb(chunk.toString());
    next();
  }
}

class NoopStream extends stream.Readable {
  setRawMode() {}

  _read() {}
}

class Aligned extends Component {
  constructor(props, context) {
    super(props, context);

    this.components = [];
    this.state = {
      components: []
    };

    this.setStream = this.setStream.bind(this);
    this.cleanStream = this.cleanStream.bind(this);
    this.updateComponent = this.updateComponent.bind(this);
  }

  componentDidMount() {
    this.props.children.forEach(this.setStream);
  }

  setStream(c, index) {
    this.cleanStream(index);

    const stream = new AlignedStream(updated => this.updateComponent(index, stripAnsi(updated)));
    const component = _.cloneDeep(c);
    render(component, {stdout: stream, stdin: new NoopStream()});
    this.components[index] = component;
  }

  cleanStream(index) {
    callTree(this.components[index], 'unmount');
  }

  componentWillReceiveProps(nextProps) {
    nextProps.children.forEach((c, i) => {
      if (!_.isEqual(c.props, this.props.children[i].props)) {
        const instance = getInstance(this.components[i]);
        instance.props = c.props;
        instance.instance._enqueueUpdate();
      }
    });
  }

  updateComponent(index, c) {
    const {components} = this.state;

    const lines = c.split('\n');
    const height = lines.length;
    const maxWidth = Math.max(...lines.map(line => stringWidth(line)));

    const maxLines = Math.max(height, ...components.filter((_, i) => i !== index).map(x => x.height));
    components[index] = {lines, maxWidth, height};

    this.setState({components, maxLines});
  }

  render(props, state) {
    const {padding} = props;

    const getPart = (c, line) => {
      const {lines, maxWidth, height} = c;

      if (line < height) {
        return lines[line] + ' '.repeat(maxWidth - stringWidth(lines[line]));
      }

      return ' '.repeat(maxWidth);
    };

    return (
      <span>
        {
          Array.apply(null, Array(state.maxLines)).map((_, line) => (
            <div>
              {
                state.components.map(c => <span>{getPart(c, line)}{' '.repeat(padding)}</span>)
              }
            </div>
          ))
        }
      </span>
    );
  }
}

Aligned.propTypes = {
  padding: PropTypes.number
};

Aligned.defaultProps = {
  padding: 2
}

module.exports = Aligned;
