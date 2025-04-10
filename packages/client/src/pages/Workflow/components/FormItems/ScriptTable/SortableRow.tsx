import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MenuOutlined } from "@ant-design/icons";

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  "data-row-key": string;
}

export const SortableRow = ({ children, ...props }: RowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props["data-row-key"],
  });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { opacity: 0.5, background: "#fafafa" } : {}),
  };

  const childrenWithHandle = React.Children.map(children, (child, index) => {
    const td = child as React.ReactElement;
    // 第一个单元格添加拖动
    if (index === 0) {
      return React.cloneElement(td, {
        children: (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: 30,
              cursor: "move",
            }}
            {...attributes}
            {...listeners}
          >
            <MenuOutlined style={{ marginRight: 8 }} />
            {React.cloneElement(td, { ...td.props, className: `!p-0` })}
          </div>
        ),
      });
    }
    return td;
  });

  return (
    <tr {...props} ref={setNodeRef} style={style} onClick={props.onClick}>
      {childrenWithHandle}
    </tr>
  );
};
