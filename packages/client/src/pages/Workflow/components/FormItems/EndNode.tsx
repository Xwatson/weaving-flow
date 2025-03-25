import React from "react";
import { Form, Input } from "antd";

interface EndNodeProps {}

const EndNode: React.FC<EndNodeProps> = () => {
  return (
    <>
      <Form.Item label="输出过滤" name="result">
        <Input.TextArea placeholder="输出过滤脚本" />
      </Form.Item>
    </>
  );
};

export default EndNode;
