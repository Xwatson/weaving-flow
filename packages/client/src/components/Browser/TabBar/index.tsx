import React, { useEffect, useState } from "react";
import { Tabs } from "antd";
import type { TabInfo } from "@weaving-flow/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import styles from "./index.module.less";

interface DraggableTabPaneProps extends React.HTMLAttributes<HTMLDivElement> {
  "data-node-key": string;
}

interface TabBarProps {
  onNewTab?: () => void;
}

const DraggableTabNode: React.FC<Readonly<DraggableTabPaneProps>> = ({
  className,
  ...props
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: props["data-node-key"],
    });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    // cursor: "move",
  };

  return React.cloneElement(props.children as React.ReactElement<any>, {
    ref: setNodeRef,
    style,
    ...attributes,
    ...listeners,
  });
};

export const TabBar: React.FC<TabBarProps> = ({ onNewTab }) => {
  const [tabs, setTabs] = useState<TabInfo[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>();

  useEffect(() => {
    // 获取初始标签页
    window.browser.getTabs().then((tabs) => {
      setTabs(tabs);
      const activeTab = tabs.find((tab) => tab.active);
      if (activeTab) {
        setActiveTabId(activeTab.id);
      }
    });

    // 监听标签页变化
    return window.browser.onTabsChanged((newTabs) => {
      console.log("Tabs changed:", newTabs);
      setTabs(newTabs);
      const activeTab = newTabs.find((tab) => tab.active);
      if (activeTab) {
        setActiveTabId(activeTab.id);
      }
    });
  }, []);

  const handleTabChange = (tabId: string) => {
    window.browser.activateTab(tabId);
  };

  const handleTabClose = (tabId: string) => {
    window.browser.closeTab(tabId);
  };

  const sensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 10 },
  });

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setTabs((prev) => {
        const activeIndex = prev.findIndex((i) => i.id === active.id);
        const overIndex = prev.findIndex((i) => i.id === over?.id);
        return arrayMove(prev, activeIndex, overIndex);
      });
    }
  };

  return (
    <div className={styles.tabBar}>
      <Tabs
        type="editable-card"
        activeKey={activeTabId}
        onChange={handleTabChange}
        onEdit={(targetKey, action) => {
          if (action === "add") {
            onNewTab?.();
          } else if (action === "remove" && typeof targetKey === "string") {
            handleTabClose(targetKey);
          }
        }}
        items={tabs.map((tab) => ({
          key: tab.id,
          label: (
            <div className={styles.tabLabel}>
              {tab.loading && <div className={styles.spinner} />}
              {tab.title || tab.url || "新标签页"}
            </div>
          ),
          closable: tabs.length > 1,
        }))}
        renderTabBar={(tabBarProps, DefaultTabBar) => (
          <DndContext
            sensors={[sensor]}
            onDragEnd={onDragEnd}
            collisionDetection={closestCenter}
          >
            <SortableContext
              items={tabs.map((i) => i.id)}
              strategy={horizontalListSortingStrategy}
            >
              <DefaultTabBar {...tabBarProps}>
                {(node) => (
                  <DraggableTabNode
                    {...(node as React.ReactElement<DraggableTabPaneProps>)
                      .props}
                    key={node.key}
                  >
                    {node}
                  </DraggableTabNode>
                )}
              </DefaultTabBar>
            </SortableContext>
          </DndContext>
        )}
      />
    </div>
  );
};
