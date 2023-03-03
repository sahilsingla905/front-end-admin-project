import React, { ReactNode, FC, useState } from "react";

import './ListItem.css';

type ChildProps = {
  children: ReactNode,
  title: ReactNode | string,
  transitionDelay?: number,
  transitionTimingFunction?: "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out" ,
  itemClass?: string,
}

const ListItem: FC<ChildProps> = ({children, title, transitionDelay = 0.5, transitionTimingFunction = 'ease-out', itemClass = ""}) => {
  const [collapsed, setCollapsed] = useState(true);

  const handleItemClick = () => {
    setCollapsed(!collapsed);
  };

  return (
    <>
      <div className={`collapsible-item ${itemClass}`} onClick={handleItemClick}>
        {title}
      </div>
      <div style={{transition: `transform ${transitionDelay}s ${transitionTimingFunction}`}} className={`content ${collapsed ? "collapsed": "expanded"}`}>
        {children}
      </div>
    </>
  );
};

export default ListItem;