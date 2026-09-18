"use client";

import { DownloadOutlined } from "@ant-design/icons";
import { Alert, Button, Spin, Table, type TableProps } from "antd";
import { useQuery } from "@tanstack/react-query";

import { listStudents, type Student } from "@/lib/api/students";
import { ApiError } from "@/lib/api/client";
import { downloadCsv } from "@/lib/csv";

const MARKS_PLACEHOLDER = "—";

const columns: TableProps<Student>["columns"] = [
  { title: "Id", dataIndex: "code", key: "code" },
  { title: "Name", dataIndex: "fullName", key: "fullName" },
  {
    title: "Total",
    key: "total",
    align: "center",
    render: () => MARKS_PLACEHOLDER,
  },
];

export const PerformanceTab = () => {
  const studentsQuery = useQuery({
    queryKey: ["results", "performance"],
    queryFn: () => listStudents({ pageSize: 1000 }),
  });

  const students = studentsQuery.data?.items ?? [];

  const handleExport = () => {
    downloadCsv(
      "performance.csv",
      ["Id", "Name", "Total"],
      students.map((s) => [s.code, s.fullName, MARKS_PLACEHOLDER]),
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          icon={<DownloadOutlined />}
          disabled={students.length === 0}
          onClick={handleExport}
        >
          Export CSV
        </Button>
      </div>

      {studentsQuery.isError ? (
        <Alert
          type="error"
          showIcon
          message="Could not load players."
          description={
            studentsQuery.error instanceof ApiError ? studentsQuery.error.message : undefined
          }
        />
      ) : studentsQuery.isLoading ? (
        <div className="flex justify-center py-10">
          <Spin />
        </div>
      ) : (
        <Table<Student>
          columns={columns}
          dataSource={students}
          rowKey="id"
          size="small"
          loading={studentsQuery.isFetching}
          scroll={{ x: "max-content" }}
        />
      )}
    </div>
  );
};
