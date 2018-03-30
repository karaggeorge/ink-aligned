const {h, Component, render, Text} = require('ink');
const Aligned = require('../lib');
const SelectInput = require('ink-select-input');

const stdin = process.stdin;

const items = [{
  label: 'First',
  value: 'first'
}, {
  label: 'Second',
  value: 'second'
}, {
  label: 'Third',
  value: 'third'
}];

const otherItems = [{
  label: 'Some',
  value: 'first'
}, {
  label: 'Other',
  value: 'second'
}, {
  label: 'Select',
  value: 'third'
}, {
  label: 'Component',
  value: 'third'
}];

class Example extends Component {
  constructor(props) {
    super(props);

    this.state = {
      current: 0
    };

    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  componentDidMount() {
    stdin.on('keypress', this.handleKeyPress);
  }

  componentWillUnmount() {
    stdin.removeListener('keypress', this.handleKeyPress);
  }

  handleKeyPress(ch, key) {
    const {current} = this.state;

    switch (key.name) {
      case 'right': {
        this.setState({ current: (current + 1) % 3 });
        break;
      }
      case 'left': {
        this.setState({ current: (current + 2) % 3 });
        break;
      }
      default: break;
    }
  }

  render() {
    const { current = 0 } = this.state;

    return (
      <Aligned padding={4}>
        <Text green={current == 0}><SelectInput items={items} focus={current === 0}/></Text>
        <Text>
          <div>Just</div>
          <div>a</div>
          <div>list</div>
          <div>of</div>
          <div>text</div>
        </Text>
        <Text green={current == 1}><SelectInput items={items} focus={current === 1}/></Text>
        <Text green={current == 2}><SelectInput items={otherItems} focus={current === 2}/></Text>
      </Aligned>
    );
  }
}

const unmount = render(<Example />);
