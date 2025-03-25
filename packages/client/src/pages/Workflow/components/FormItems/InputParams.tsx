import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Space } from "antd";
import React from "react";

interface InputParamsProps {}

const InputParams: React.FC<InputParamsProps> = () => {
  return (
    <>
      <p>输入变量</p>
      <Form.List name="input">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space
                key={key}
                style={{ display: "flex", marginBottom: 8 }}
                align="baseline"
              >
                <Form.Item
                  {...restField}
                  name={[name, "name"]}
                  rules={[{ required: true, message: "请输入变量名称" }]}
                  style={{ width: 120 }}
                >
                  <Input placeholder="变量名称" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, "value"]}
                  rules={[{ required: true, message: "请输入变量值" }]}
                  style={{ flex: 1 }}
                >
                  <Input placeholder="变量值" />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                添加变量
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </>
  );
};

export default InputParams;
