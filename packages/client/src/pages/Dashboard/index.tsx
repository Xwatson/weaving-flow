import { Card, Row, Col, Statistic } from 'antd';
import { 
  BookOutlined, 
  KeyOutlined, 
  ApiOutlined,
  ScheduleOutlined 
} from '@ant-design/icons';

const Dashboard = () => {
  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="书签数量" 
              value={0} 
              prefix={<BookOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="凭证数量" 
              value={0} 
              prefix={<KeyOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="爬虫任务" 
              value={0} 
              prefix={<ApiOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="工作流" 
              value={0} 
              prefix={<ScheduleOutlined />} 
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
