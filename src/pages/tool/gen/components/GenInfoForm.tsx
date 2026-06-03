import type { FormInstance } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Col, Form, Input, Radio, Row, Select, Switch, Tooltip, TreeSelect } from 'antd';
import { useMemo } from 'react';
import type { MenuVO } from '@/api/system/menu/types';
import type { DbColumnVO, DbTableVO } from '@/api/tool/gen/types';
import { sortableJavaTypes } from './genConfig';

interface GenInfoFormProps {
  form: FormInstance<DbTableVO>;
  columns: DbColumnVO[];
  menuOptions: MenuVO[];
}

export default function GenInfoForm({ form, columns, menuOptions }: GenInfoFormProps) {
  const tplCategory = Form.useWatch('tplCategory', form);
  const enableStatus = Form.useWatch('enableStatus', form);
  const enableUnique = Form.useWatch('enableUnique', form);
  const enableSort = Form.useWatch('enableSort', form);
  const sortableColumns = useMemo(
    () => columns.filter(column => sortableJavaTypes.includes(column.javaType || '')),
    [columns]
  );
  const columnOptions = columns.map(column => ({
    label: `${column.columnName}：${column.columnComment || ''}`,
    value: column.columnName
  }));
  const sortableColumnOptions = sortableColumns.map(column => ({
    label: `${column.columnName}：${column.columnComment || ''}`,
    value: column.columnName
  }));
  const frontendTypeOptions = [
    { label: 'Vue', value: 'vue' },
    { label: 'React', value: 'react' }
  ];

  return (
    <>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="tplCategory" label="生成模板" rules={[{ required: true, message: '请选择生成模板' }]}>
            <Select
              options={[
                { label: '单表（增删改查）', value: 'crud' },
                { label: '树表（增删改查）', value: 'tree' }
              ]}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="packageName" label="生成包路径" rules={[{ required: true, message: '请输入生成包路径' }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="moduleName" label="生成模块名" rules={[{ required: true, message: '请输入生成模块名' }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="businessName" label="生成业务名" rules={[{ required: true, message: '请输入生成业务名' }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="functionName" label="生成功能名" rules={[{ required: true, message: '请输入生成功能名' }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="parentMenuId" label="上级菜单">
            <TreeSelect
              allowClear
              showSearch
              treeData={menuOptions}
              fieldNames={{ label: 'menuName', value: 'menuId', children: 'children' }}
              treeDefaultExpandAll
              placeholder="选择上级菜单"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="frontendType"
            label={
              <span>
                前端模板{' '}
                <Tooltip title="对应后端 resources/vm 下的模板目录，例如 vue、react">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            rules={[
              { required: true, message: '请选择前端模板' },
              { pattern: /^[A-Za-z0-9_-]+$/, message: '仅支持字母、数字、下划线和中划线' }
            ]}
          >
            <Radio.Group options={frontendTypeOptions} />
          </Form.Item>
        </Col>
      </Row>

      <h4 className="form-header">增强选项</h4>
      <Row gutter={16}>
        <Col xs={24}>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="enableExport" label="导出能力" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Col>

        <Col xs={24}>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="enableStatus" label="状态切换" valuePropName="checked">
                <Switch onChange={checked => !checked && form.setFieldValue('statusField', '')} />
              </Form.Item>
            </Col>
            {enableStatus && (
              <Col xs={24} md={16}>
                <Form.Item name="statusField" label="状态字段" rules={[{ required: true, message: '请选择状态字段' }]}>
                  <Select options={columnOptions} />
                </Form.Item>
              </Col>
            )}
          </Row>
        </Col>

        <Col xs={24}>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="enableUnique" label="组合唯一校验" valuePropName="checked">
                <Switch onChange={checked => !checked && form.setFieldValue('uniqueFields', [])} />
              </Form.Item>
            </Col>
            {enableUnique && (
              <Col xs={24} md={16}>
                <Form.Item name="uniqueFields" label="唯一字段" rules={[{ required: true, message: '请选择唯一字段' }]}>
                  <Select mode="multiple" options={columnOptions} />
                </Form.Item>
              </Col>
            )}
          </Row>
        </Col>

        <Col xs={24}>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="enableSort" label="排序调整" valuePropName="checked">
                <Switch onChange={checked => !checked && form.setFieldValue('sortField', '')} />
              </Form.Item>
            </Col>
            {enableSort && (
              <Col xs={24} md={16}>
                <Form.Item name="sortField" label="排序字段" rules={[{ required: true, message: '请选择排序字段' }]}>
                  <Select options={sortableColumnOptions} />
                </Form.Item>
              </Col>
            )}
          </Row>
        </Col>
      </Row>

      {tplCategory === 'tree' && (
        <>
          <h4 className="form-header">其他信息</h4>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="treeCode" label="树编码字段" rules={[{ required: true, message: '请选择树编码字段' }]}>
                <Select options={columnOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="treeParentCode"
                label="树父编码字段"
                rules={[{ required: true, message: '请选择树父编码字段' }]}
              >
                <Select options={columnOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="treeName" label="树名称字段" rules={[{ required: true, message: '请选择树名称字段' }]}>
                <Select options={columnOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="treeRootValue" label="根节点值" rules={[{ required: true, message: '请输入根节点值' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="treeAncestorsField" label="祖级字段">
                <Select allowClear options={columnOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="treeOrderField" label="树排序字段">
                <Select allowClear options={sortableColumnOptions} />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}
    </>
  );
}
