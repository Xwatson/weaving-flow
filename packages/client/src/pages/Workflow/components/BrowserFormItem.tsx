import React from "react";
import { Form, Input, InputNumber, Switch } from "antd";

interface BrowserFormItemProps {}

const BrowserFormItem: React.FC<BrowserFormItemProps> = () => {
  return (
    <>
      <Form.Item label="URL" name="url" rules={[{ required: true }]}>
        <Input placeholder="请输入URL" />
      </Form.Item>
      <Form.Item label="窗口宽度" name="width">
        <InputNumber min={800} max={1920} defaultValue={1280} />
      </Form.Item>
      <Form.Item label="窗口高度" name="height">
        <InputNumber min={600} max={1080} defaultValue={800} />
      </Form.Item>
      <Form.Item label="显示浏览器" name="visible" valuePropName="checked">
        <Switch defaultChecked />
      </Form.Item>
      <Form.Item label="User-Agent" name="userAgent">
        <Input placeholder="自定义User-Agent" />
      </Form.Item>
    </>
  );
};

export default BrowserFormItem;
