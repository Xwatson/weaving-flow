import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';

interface PlaceholderProps {
  title: string;
}

const Placeholder = ({ title }: PlaceholderProps) => {
  return (
    <Result
      title={`${title}页面正在开发中`}
      extra={
        <Link to="/dashboard">
          <Button type="primary">返回仪表盘</Button>
        </Link>
      }
    />
  );
};

export default Placeholder;
