import { DeleteOutlined, DownloadOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
  type ActionType,
  type ProColumns
} from '@ant-design/pro-components';
import { useBoolean } from 'ahooks';
import { Button, Form, message, Popconfirm, Tag } from 'antd';
import { useRef, useState } from 'react';
import type { DictData, DictDataForm, DictDataQuery } from '@/api/system/dict/data/types';
import type { DictTypeForm, DictTypeQuery, DictTypeVO } from '@/api/system/dict/type/types';
import { addData, delData, getData, listData, updateData } from '@/api/system/dict/data';
import { addType, delType, getType, listType, refreshCache, updateType } from '@/api/system/dict/type';
import EllipsisText from '@/components/common/EllipsisText';
import RowActions from '@/components/common/RowActions';
import { useTableExport } from '@/hooks/useTableExport';
import { useTableScroll } from '@/hooks/useTableScroll';
import { useTableSelection } from '@/hooks/useTableSelection';
import { useDictStore } from '@/stores/dictStore';
import { useUserStore } from '@/stores/userStore';
import { hasPermi } from '@/utils/permission';
import { queryClient } from '@/utils/queryClient';
import { toPageQuery, toTableData } from '@/utils/ruoyi';

const listClassOptions = [
  { value: 'default', label: '默认(default)' },
  { value: 'primary', label: '主要(primary)' },
  { value: 'success', label: '成功(success)' },
  { value: 'info', label: '信息(info)' },
  { value: 'warning', label: '警告(warning)' },
  { value: 'danger', label: '危险(danger)' }
];

const defaultTypeForm: DictTypeForm = {};
const defaultDataForm: DictDataForm = { listClass: 'primary', dictSort: 0 };

function tagColor(listClass?: string) {
  const colors: Record<string, string> = {
    primary: 'blue',
    success: 'green',
    info: 'default',
    warning: 'orange',
    danger: 'red'
  };
  return colors[listClass || ''] || undefined;
}

export default function SystemDictPage() {
  const typeActionRef = useRef<ActionType | undefined>(undefined);
  const dataActionRef = useRef<ActionType | undefined>(undefined);
  const { tableScroll: typeTableScroll, tableWrapperRef: typeTableWrapperRef } = useTableScroll(702);
  const { tableScroll: dataTableScroll, tableWrapperRef: dataTableWrapperRef } = useTableScroll(816);
  const [typeForm] = Form.useForm<DictTypeForm>();
  const [dataForm] = Form.useForm<DictDataForm>();
  const userInfo = useUserStore(state => state.userInfo);
  const [currentDict, setCurrentDict] = useState<DictTypeVO>();
  const {
    ids: typeIds,
    selectedOne: selectedTypeOne,
    handleSelectionChange: handleTypeSelectionChange,
    clearSelection: clearTypeSelection
  } = useTableSelection<DictTypeVO>(row => row.dictId);
  const {
    ids: dataIds,
    selectedOne: selectedDataOne,
    handleSelectionChange: handleDataSelectionChange,
    clearSelection: clearDataSelection
  } = useTableSelection<DictData>(row => row.dictCode);
  const clearDicts = useDictStore(state => state.clearDicts);
  const [typeModalOpen, { setTrue: openTypeModal, setFalse: closeTypeModal }] = useBoolean(false);
  const [typeModalTitle, setTypeModalTitle] = useState('');
  const [dataModalOpen, { setTrue: openDataModal, setFalse: closeDataModal }] = useBoolean(false);
  const [dataModalTitle, setDataModalTitle] = useState('');
  const { updateExportParams: updateTypeExportParams, exportFile: exportTypeFile } = useTableExport();
  const { updateExportParams: updateDataExportParams, exportFile: exportDataFile } = useTableExport();

  const canAdd = hasPermi(userInfo, ['system:dict:add']);
  const canEdit = hasPermi(userInfo, ['system:dict:edit']);
  const canRemove = hasPermi(userInfo, ['system:dict:remove']);
  const canExport = hasPermi(userInfo, ['system:dict:export']);
  const selectDict = (row: DictTypeVO) => {
    setCurrentDict(row);
    clearDataSelection();
    dataActionRef.current?.reloadAndRest?.();
  };

  const openTypeAdd = () => {
    typeForm.resetFields();
    typeForm.setFieldsValue(defaultTypeForm);
    setTypeModalTitle('添加字典类型');
    openTypeModal();
  };

  const openTypeEdit = async (row?: DictTypeVO) => {
    const target = row || selectedTypeOne;
    if (!target?.dictId) return;
    const res = await getType(target.dictId);
    typeForm.resetFields();
    typeForm.setFieldsValue(res.data);
    setTypeModalTitle('修改字典类型');
    openTypeModal();
  };

  const submitType = async (values: DictTypeForm) => {
    values.dictId ? await updateType(values) : await addType(values);
    message.success('操作成功');
    typeForm.resetFields();
    typeActionRef.current?.reload();
    return true;
  };

  const removeType = async (row?: DictTypeVO) => {
    await delType(row?.dictId || typeIds);
    message.success('删除成功');
    setCurrentDict(undefined);
    clearTypeSelection();
    clearDataSelection();
    dataActionRef.current?.reload();
    typeActionRef.current?.reloadAndRest?.();
  };

  const openDataAdd = () => {
    if (!currentDict) {
      message.warning('请先选择字典');
      return;
    }
    dataForm.resetFields();
    dataForm.setFieldsValue({ ...defaultDataForm, dictType: currentDict.dictType });
    setDataModalTitle('添加字典数据');
    openDataModal();
  };

  const openDataEdit = async (row?: DictData) => {
    if (!currentDict) {
      message.warning('请先选择字典');
      return;
    }
    const target = row || selectedDataOne;
    if (!target?.dictCode) return;
    const res = await getData(target.dictCode);
    dataForm.resetFields();
    dataForm.setFieldsValue(res.data);
    setDataModalTitle('修改字典数据');
    openDataModal();
  };

  const submitData = async (values: DictDataForm) => {
    values.dictCode ? await updateData(values) : await addData(values);
    message.success('操作成功');
    dataForm.resetFields();
    dataActionRef.current?.reload();
    return true;
  };

  const removeData = async (row?: DictData) => {
    await delData(row?.dictCode || dataIds);
    message.success('删除成功');
    clearDataSelection();
    dataActionRef.current?.reloadAndRest?.();
  };

  const typeColumns: ProColumns<DictTypeVO>[] = [
    {
      title: '字典名称',
      dataIndex: 'dictName',
      width: 140,
      render: (_, row) => <EllipsisText value={row.dictName} maxWidth={120} />
    },
    {
      title: '字典类型',
      dataIndex: 'dictType',
      width: 160,
      render: (_, row) => (
        <Button type="link" size="small" onClick={() => selectDict(row)}>
          <EllipsisText value={row.dictType} maxWidth={130} />
        </Button>
      )
    },
    {
      title: '备注',
      dataIndex: 'remark',
      search: false,
      width: 150,
      render: (_, row) => <EllipsisText value={row.remark} maxWidth={130} />
    },
    { title: '创建时间', dataIndex: 'createTime', valueType: 'dateTime', search: false, width: 160 },
    {
      title: '操作',
      valueType: 'option',
      width: 92,
      fixed: 'right',
      render: (_, row) => (
        <RowActions
          actions={[
            canEdit && { key: 'edit', label: '修改', icon: <EditOutlined />, onClick: () => openTypeEdit(row) },
            canRemove && {
              key: 'delete',
              label: '删除',
              icon: <DeleteOutlined />,
              danger: true,
              confirm: `是否确认删除字典编号为"${row.dictId}"的数据项？`,
              onClick: () => removeType(row)
            }
          ]}
        />
      )
    }
  ];

  const dataColumns: ProColumns<DictData>[] = [
    {
      title: '字典标签',
      dataIndex: 'dictLabel',
      width: 150,
      render: (_, row) =>
        row.listClass && row.listClass !== 'default' ? (
          <Tag color={tagColor(row.listClass)}>{row.dictLabel}</Tag>
        ) : (
          <EllipsisText value={row.dictLabel} maxWidth={130} />
        )
    },
    {
      title: '字典键值',
      dataIndex: 'dictValue',
      search: false,
      width: 140,
      render: (_, row) => <EllipsisText value={row.dictValue} maxWidth={120} />
    },
    { title: '字典排序', dataIndex: 'dictSort', search: false, width: 112 },
    {
      title: '备注',
      dataIndex: 'remark',
      search: false,
      width: 150,
      render: (_, row) => <EllipsisText value={row.remark} maxWidth={130} />
    },
    { title: '创建时间', dataIndex: 'createTime', valueType: 'dateTime', search: false, width: 160 },
    {
      title: '操作',
      valueType: 'option',
      width: 104,
      fixed: 'right',
      render: (_, row) => (
        <RowActions
          actions={[
            canEdit && { key: 'edit', label: '修改', icon: <EditOutlined />, onClick: () => openDataEdit(row) },
            canRemove && {
              key: 'delete',
              label: '删除',
              icon: <DeleteOutlined />,
              danger: true,
              confirm: `是否确认删除字典编码为"${row.dictCode}"的数据项？`,
              onClick: () => removeData(row)
            }
          ]}
        />
      )
    }
  ];

  return (
    <PageContainer title="字典管理">
      <div className="dict-grid">
        <section ref={typeTableWrapperRef} className="dict-panel">
          <ProTable<DictTypeVO, DictTypeQuery>
            actionRef={typeActionRef}
            rowKey="dictId"
            columns={typeColumns}
            scroll={typeTableScroll}
            search={{ labelWidth: 90 }}
            rowClassName={row => (row.dictId === currentDict?.dictId ? 'dict-row-current' : '')}
            rowSelection={{ selectedRowKeys: typeIds, onChange: handleTypeSelectionChange }}
            onRow={row => ({ onClick: () => selectDict(row) })}
            request={async params => {
              const query = toPageQuery(params);
              updateTypeExportParams(query);
              const res = await listType(query);
              if (!currentDict && res.data.rows.length) {
                setCurrentDict(res.data.rows[0]);
              }
              return toTableData(res);
            }}
            toolbar={{ title: '字典类型' }}
            toolBarRender={() => [
              canAdd && (
                <Button key="add" type="primary" icon={<PlusOutlined />} onClick={openTypeAdd}>
                  新增
                </Button>
              ),
              canEdit && (
                <Button key="edit" disabled={!selectedTypeOne} icon={<EditOutlined />} onClick={() => openTypeEdit()}>
                  修改
                </Button>
              ),
              canRemove && (
                <Popconfirm
                  key="delete"
                  title={`是否确认删除字典编号为"${typeIds}"的数据项？`}
                  onConfirm={() => removeType()}
                >
                  <Button danger disabled={!typeIds.length} icon={<DeleteOutlined />}>
                    删除
                  </Button>
                </Popconfirm>
              ),
              canExport && (
                <Button
                  key="export"
                  icon={<DownloadOutlined />}
                  onClick={() => exportTypeFile('/system/dict/type/export', () => `dict_${Date.now()}.xlsx`)}
                >
                  导出
                </Button>
              ),
              canRemove && (
                <Button
                  key="refresh"
                  danger
                  icon={<ReloadOutlined />}
                  onClick={async () => {
                    await refreshCache();
                    clearDicts();
                    await queryClient.invalidateQueries({ queryKey: ['dict'] });
                    message.success('刷新成功');
                  }}
                >
                  刷新缓存
                </Button>
              )
            ]}
          />
        </section>

        <section ref={dataTableWrapperRef} className="dict-panel">
          <ProTable<DictData, DictDataQuery>
            actionRef={dataActionRef}
            rowKey="dictCode"
            columns={dataColumns}
            scroll={dataTableScroll}
            search={{ labelWidth: 90 }}
            params={{ dictType: currentDict?.dictType }}
            rowSelection={{ selectedRowKeys: dataIds, onChange: handleDataSelectionChange }}
            request={async params => {
              if (!currentDict?.dictType) {
                return { data: [], total: 0, success: true };
              }
              const query = { ...toPageQuery(params), dictType: currentDict.dictType };
              updateDataExportParams(query);
              const res = await listData(query);
              return toTableData(res);
            }}
            toolbar={{
              title: currentDict ? `字典数据：${currentDict.dictName} / ${currentDict.dictType}` : '字典数据'
            }}
            toolBarRender={() => [
              canAdd && (
                <Button key="add" type="primary" disabled={!currentDict} icon={<PlusOutlined />} onClick={openDataAdd}>
                  新增
                </Button>
              ),
              canEdit && (
                <Button
                  key="edit"
                  disabled={!currentDict || !selectedDataOne}
                  icon={<EditOutlined />}
                  onClick={() => openDataEdit()}
                >
                  修改
                </Button>
              ),
              canRemove && (
                <Popconfirm
                  key="delete"
                  title={`是否确认删除字典编码为"${dataIds}"的数据项？`}
                  onConfirm={() => removeData()}
                >
                  <Button danger disabled={!currentDict || !dataIds.length} icon={<DeleteOutlined />}>
                    删除
                  </Button>
                </Popconfirm>
              ),
              canExport && (
                <Button
                  key="export"
                  disabled={!currentDict}
                  icon={<DownloadOutlined />}
                  onClick={() => exportDataFile('/system/dict/data/export', () => `dict_data_${Date.now()}.xlsx`)}
                >
                  导出
                </Button>
              )
            ]}
          />
        </section>
      </div>

      <ModalForm<DictTypeForm>
        title={typeModalTitle}
        open={typeModalOpen}
        width={520}
        form={typeForm}
        layout="vertical"
        initialValues={defaultTypeForm}
        modalProps={{ destroyOnHidden: true, onCancel: closeTypeModal }}
        onOpenChange={open => !open && closeTypeModal()}
        onFinish={submitType}
      >
        <ProFormText name="dictId" hidden />
        <ProFormText name="dictName" label="字典名称" rules={[{ required: true, message: '字典名称不能为空' }]} />
        <ProFormText
          name="dictType"
          label="字典类型"
          fieldProps={{ maxLength: 100 }}
          rules={[{ required: true, message: '字典类型不能为空' }]}
        />
        <ProFormTextArea name="remark" label="备注" fieldProps={{ rows: 3 }} />
      </ModalForm>

      <ModalForm<DictDataForm>
        title={dataModalTitle}
        open={dataModalOpen}
        width={520}
        form={dataForm}
        layout="vertical"
        initialValues={defaultDataForm}
        modalProps={{ destroyOnHidden: true, onCancel: closeDataModal }}
        onOpenChange={open => !open && closeDataModal()}
        onFinish={submitData}
      >
        <ProFormText name="dictCode" hidden />
        <ProFormText name="dictType" label="字典类型" fieldProps={{ disabled: true }} />
        <ProFormText name="dictLabel" label="数据标签" rules={[{ required: true, message: '数据标签不能为空' }]} />
        <ProFormText name="dictValue" label="数据键值" rules={[{ required: true, message: '数据键值不能为空' }]} />
        <ProFormText name="cssClass" label="样式属性" />
        <ProFormDigit
          name="dictSort"
          label="显示排序"
          min={0}
          rules={[{ required: true, message: '显示排序不能为空' }]}
        />
        <ProFormSelect name="listClass" label="回显样式" options={listClassOptions} />
        <ProFormTextArea name="remark" label="备注" fieldProps={{ rows: 3 }} />
      </ModalForm>
    </PageContainer>
  );
}
