import React from "react";
import { Table } from "antd";
import { PaginationConfig, SorterResult } from "antd/lib/table";
import { converFilter } from "@/utils/utils";

interface Props {
    loading: boolean;
    dataSource: any[];
    columns: any[];
    rowKey: string;
    onSearch: Function;
    paginationConfig: any;
}
const ProTable = (props: Props) => {
    const { loading, dataSource, columns, rowKey, onSearch, paginationConfig } = props;

    const onTableChange = (
        pagination: PaginationConfig,
        filters: any,
        sorter: SorterResult<any>,
    ) => {
        onSearch({
            pageIndex: Number(pagination.current) - 1,
            pageSize: pagination.pageSize,
            sorts: sorter,
            terms: converFilter(filters, '$IN'),
        })
    }
    return (
        <Table
            loading={loading}
            dataSource={dataSource}
            columns={columns}
            rowKey={rowKey}
            onChange={onTableChange}
            pagination={{
                current: paginationConfig.pageIndex + 1,
                total: paginationConfig.total,
                pageSize: paginationConfig.pageSize,
                showQuickJumper: true,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                showTotal: (total: number) =>
                    `共 ${total} 条记录 第  ${paginationConfig.pageIndex + 1}/${Math.ceil(
                        paginationConfig.total / paginationConfig.pageSize,
                    )}页`,
            }}
        />
    )
}
export default ProTable;