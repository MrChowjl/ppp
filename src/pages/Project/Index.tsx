import React, { useRef, useState } from 'react';
import { PlusOutlined, EllipsisOutlined } from '@ant-design/icons';
import { Button, Tag, Space, Menu, Popconfirm, message } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable, { TableDropdown } from '@ant-design/pro-table';
import AccountEdit from './components/AccountEdit'
import Qualifications from './components/Qualifications'
import { queryList, deleteCurrent } from './request'
import { history } from 'umi';
type GithubIssueItem = {
  url: string;
  id: number;
  number: number;
  title: string;
  labels: {
    name: string;
    color: string;
  }[];
  state: string;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at?: string;
};

const Page: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [editShow, seteditShow] = useState<boolean>(false)
  const [select, setselect] = useState<string>()
  const confirm = (id: string) => {
    deleteCurrent({ k: id.toString() }).then(res => {
      if (res.code === 1) {
        message.success(res.msg)
        actionRef.current?.reload()
      }
    })
  }
  const statusMap = {
    '0': <Tag color="orange">等待审核</Tag>,
    '1': <Tag color="green">审核通过</Tag>,
    '-1': <Tag color="red">审核未过</Tag>
  }
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      dataIndex: 'id',
      title: 'id',
      hideInSearch: true,
      width: 48,
    },
    {
      title: '项目名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '包含投放账户数',
      dataIndex: 'ad_acc_ids',
      hideInSearch: true,
      ellipsis: true,
      render: (e, r) => {
        return r?.ad_acc_ids?.length
      }
    },
    {
      title: '添加时间',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: '操作',
      width: 255,
      valueType: 'option',
      hideInSearch: true,
      render: (text, record, _, action) => [
        <Button type="primary" onClick={() => {
          history.push(`/report?id=${record.id}`)
        }}>项目报表</Button>,
        <Button type="primary"  onClick={() => {
          seteditShow(true)
          setselect(record?.id)
        }}>编辑</Button>,
        <Popconfirm title="您将要删除本条项目？" placement="bottom" onConfirm={() => confirm(record?.id)} okText="Yes" cancelText="No">
          <Button>删除</Button>
        </Popconfirm>
      ]
    },
  ];

  return (
    <>
      <ProTable<any>
        columns={columns}
        actionRef={actionRef}
        request={async (
          // 第一个参数 params 查询表单和 params 参数的结合
          // 第一个参数中一定会有 pageSize 和  current ，这两个参数是 antd 的规范
          params: T & {
            pageSize: number;
            current: number;
          },
          sort,
          filter,
        ) => {
          // 这里需要返回一个 Promise,在返回之前你可以进行数据转化
          // 如果需要转化参数可以在这里进行修改
          const msg = await queryList({
            page: params.current,
            limit: params.pageSize,
            sort: sort,
            name: params.name
          });
          return {
            data: msg.data,
            // success 请返回 true，
            // 不然 table 会停止解析数据，即使有数据
            success: true,
            // 不传会使用 data 的长度，如果是分页一定要传
            total: msg.count,
          };
        }}
        rowKey="id"
        form={{
          // 由于配置了 transform，提交的参与与定义的不同这里需要转化一下
          syncToUrl: (values, type) => {
            if (type === 'get') {
              return {
                ...values,
                created_at: [values.startTime, values.endTime],
              };
            }
            return values;
          },
        }}
        pagination={{
          pageSize: 20,
        }}
        dateFormatter="string"
        headerTitle={false}
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} onClick={() => {
            seteditShow(true)
            setselect('')
          }} type="primary">
            添加项目
          </Button>
        ]}
      />
      {editShow && <AccountEdit reload={() => actionRef.current?.reload()} Select={select} onCancel={() => seteditShow(false)} />}
    </>
  );
};
export default Page