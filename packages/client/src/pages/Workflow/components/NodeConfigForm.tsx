import React from 'react';
import { Form, Select, Input, Button, Space, Card, Collapse } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Panel } = Collapse;

interface NodeConfig {
  type: string;
  config: Record<string, any>;
}

interface NodeConfigFormProps {
  form: FormInstance;
}

const nodeTypes = [
  { label: '开始节点', value: 'start' },
  { label: '浏览器节点', value: 'browser' },
  { label: '脚本执行节点', value: 'scriptExecute' },
  { label: '结束节点', value: 'end' },
];

// 不同节点类型的配置表单
const nodeConfigForms: Record<string, React.FC<{ form: FormInstance }>> = {
  start: ({ form }) => (
    <div>
      <Form.List name={['config', 'inputs']}>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Card
                key={key}
                size="small"
                style={{ marginBottom: 16 }}
                extra={
                  <DeleteOutlined onClick={() => remove(name)} />
                }
              >
                <Form.Item
                  {...restField}
                  name={[name, 'name']}
                  label="参数名称"
                  rules={[{ required: true, message: '请输入参数名称' }]}
                >
                  <Input placeholder="请输入参数名称" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'type']}
                  label="参数类型"
                  rules={[{ required: true, message: '请选择参数类型' }]}
                >
                  <Select
                    options={[
                      { label: '字符串', value: 'string' },
                      { label: '数字', value: 'number' },
                      { label: '布尔值', value: 'boolean' },
                    ]}
                  />
                </Form.Item>
                <Form.Item {...restField} name={[name, 'description']} label="描述">
                  <Input.TextArea placeholder="请输入参数描述" />
                </Form.Item>
              </Card>
            ))}
            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
              添加输入参数
            </Button>
          </>
        )}
      </Form.List>
    </div>
  ),

  browser: ({ form }) => (
    <div>
      <Form.Item name={['config', 'width']} label="窗口宽度" initialValue={1280}>
        <Input type="number" />
      </Form.Item>
      <Form.Item name={['config', 'height']} label="窗口高度" initialValue={800}>
        <Input type="number" />
      </Form.Item>
    </div>
  ),

  scriptExecute: ({ form }) => (
    <div>
      <Form.Item name={['config', 'enableCaptchaCheck']} valuePropName="checked" label="启用验证码检测">
        <Input type="checkbox" />
      </Form.Item>
      <Form.Item
        name={['config', 'captchaCheckScript']}
        label="验证码检测脚本"
        tooltip="返回 true 表示存在验证码，false 表示无验证码或验证码已处理"
      >
        <Input.TextArea rows={4} placeholder="请输入验证码检测脚本" />
      </Form.Item>
      <Form.Item name={['config', 'script']} label="执行脚本" rules={[{ required: true }]}>
        <Input.TextArea rows={6} placeholder="请输入执行脚本" />
      </Form.Item>
    </div>
  ),

  end: ({ form }) => (
    <div>
      <Form.List name={['config', 'outputs']}>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Card
                key={key}
                size="small"
                style={{ marginBottom: 16 }}
                extra={
                  <DeleteOutlined onClick={() => remove(name)} />
                }
              >
                <Form.Item
                  {...restField}
                  name={[name, 'name']}
                  label="输出名称"
                  rules={[{ required: true, message: '请输入输出名称' }]}
                >
                  <Input placeholder="请输入输出名称" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'type']}
                  label="输出类型"
                  rules={[{ required: true, message: '请选择输出类型' }]}
                >
                  <Select
                    options={[
                      { label: '字符串', value: 'string' },
                      { label: '数字', value: 'number' },
                      { label: '数组', value: 'array' },
                      { label: '对象', value: 'object' },
                    ]}
                  />
                </Form.Item>
                <Form.Item {...restField} name={[name, 'description']} label="描述">
                  <Input.TextArea placeholder="请输入输出描述" />
                </Form.Item>
              </Card>
            ))}
            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
              添加输出参数
            </Button>
          </>
        )}
      </Form.List>
    </div>
  ),
};

export const NodeConfigForm: React.FC<NodeConfigFormProps> = ({ form }) => {
  const [nodes, setNodes] = React.useState<NodeConfig[]>([]);

  const handleAddNode = () => {
    setNodes([...nodes, { type: '', config: {} }]);
  };

  const handleRemoveNode = (index: number) => {
    const newNodes = [...nodes];
    newNodes.splice(index, 1);
    setNodes(newNodes);
  };

  const handleNodeTypeChange = (type: string, index: number) => {
    const newNodes = [...nodes];
    newNodes[index] = { type, config: {} };
    setNodes(newNodes);
  };

  return (
    <Form form={form} layout="vertical">
      <Collapse>
        {nodes.map((node, index) => (
          <Panel
            header={`节点 ${index + 1}: ${nodeTypes.find(t => t.value === node.type)?.label || '未选择类型'}`}
            key={index}
            extra={<DeleteOutlined onClick={() => handleRemoveNode(index)} />}
          >
            <Form.Item label="节点类型" required>
              <Select
                value={node.type}
                onChange={(value) => handleNodeTypeChange(value, index)}
                options={nodeTypes}
                placeholder="请选择节点类型"
              />
            </Form.Item>
            {node.type && nodeConfigForms[node.type]?.({ form })}
          </Panel>
        ))}
      </Collapse>
      <div style={{ marginTop: 16 }}>
        <Button type="dashed" onClick={handleAddNode} block icon={<PlusOutlined />}>
          添加节点
        </Button>
      </div>
    </Form>
  );
};
