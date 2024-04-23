import React, { useRef } from "react";
import { Flex } from "@design-system/widgets";

import { Search } from "./Search";
import styles from "./styles.module.css";
import type { SearchProps } from "./Search";
import type { PaginationProps } from "./Pagination";
import { Pagination } from "./Pagination";

interface TableHeaderProps extends SearchProps, PaginationProps {}

function TableHeader(props: TableHeaderProps) {
  const { columns, isVisibleSearch, onSearch, searchKey, tableData, ...rest } =
    props;
  const tableHeaderRef = useRef<HTMLDivElement>(null);

  const content = (() => {
    return (
      <>
        <Search
          isVisibleSearch={isVisibleSearch}
          onSearch={onSearch}
          searchKey={searchKey}
        />
        <Flex flexGrow={1} gap="spacing-1" justifyContent="space-between">
          <Pagination columns={columns} tableData={tableData} {...rest} />
        </Flex>
      </>
    );
  })();

  return (
    <div className={styles["table-header"]} ref={tableHeaderRef}>
      <div data-layout="">{content}</div>
    </div>
  );
}

export { TableHeader };
