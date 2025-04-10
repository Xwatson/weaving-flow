import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import { Table } from "antd";
import type { TableProps } from "antd";
import { FormInstance } from "antd";
import { SortableRow } from "./SortableRow";
import { ScriptItem } from "./types";

interface DraggableTableProps<T extends object>
  extends Omit<TableProps<T>, "components" | "onRow"> {
  form: FormInstance;
  onOpenModal: (index: number) => void;
}

const DraggableTable = <T extends ScriptItem>({
  form,
  onOpenModal,
  ...props
}: DraggableTableProps<T>) => {
  const dataSource = props.dataSource || [];
  const [items, setItems] = useState(
    dataSource.map((item: any) => ({ ...item }))
  );

  useEffect(() => {
    setItems(dataSource.map((item: any) => ({ ...item })));
  }, [dataSource]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeIndex = items.findIndex(
        (item: any) => item.key === active.id
      );
      const overIndex = items.findIndex((item: any) => item.key === over.id);

      const newItems = arrayMove(items, activeIndex, overIndex);
      setItems(newItems);

      // 更新表单中的数据
      const scripts = form.getFieldValue("scripts") || [];
      const newScripts = arrayMove(scripts, activeIndex, overIndex);
      form.setFieldsValue({ scripts: newScripts });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item: any) => item.key)}
        strategy={verticalListSortingStrategy}
      >
        <Table
          {...props}
          components={{
            body: {
              row: (rowProps: any) => {
                if (items.length === 0) return null;
                return (
                  <SortableRow
                    {...rowProps}
                    onClick={() => {
                      const index = rowProps["data-row-key"];
                      onOpenModal(Number(index));
                    }}
                  />
                );
              },
            },
          }}
          dataSource={items as any}
          onRow={() => ({
            style: { cursor: "pointer" },
          })}
        />
      </SortableContext>
    </DndContext>
  );
};

export default DraggableTable;
