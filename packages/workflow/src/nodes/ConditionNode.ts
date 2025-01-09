import { BaseNode, NodeInput, NodeOutput } from '../core/BaseNode';

export class ConditionNode extends BaseNode {
  constructor(name: string, config: Record<string, any> = {}) {
    super(name, 'condition', config);
  }

  getInputDefinitions(): NodeInput[] {
    return [
      {
        name: 'value',
        type: 'any',
        required: true,
      },
      {
        name: 'operator',
        type: 'string',
        required: true,
      },
      {
        name: 'compareValue',
        type: 'any',
        required: true,
      },
    ];
  }

  getOutputDefinitions(): NodeOutput[] {
    return [
      {
        name: 'true',
        type: 'boolean',
      },
      {
        name: 'false',
        type: 'boolean',
      },
    ];
  }

  async execute(): Promise<void> {
    const value = this.getInput('value');
    const operator = this.getInput('operator');
    const compareValue = this.getInput('compareValue');

    let result = false;

    switch (operator) {
      case '==':
        result = value == compareValue;
        break;
      case '===':
        result = value === compareValue;
        break;
      case '!=':
        result = value != compareValue;
        break;
      case '!==':
        result = value !== compareValue;
        break;
      case '>':
        result = value > compareValue;
        break;
      case '>=':
        result = value >= compareValue;
        break;
      case '<':
        result = value < compareValue;
        break;
      case '<=':
        result = value <= compareValue;
        break;
      case 'includes':
        result = value?.includes?.(compareValue) ?? false;
        break;
      case 'regex':
        result = new RegExp(compareValue).test(String(value));
        break;
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }

    this.setOutput('true', result);
    this.setOutput('false', !result);
  }
}
