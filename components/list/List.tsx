import React, { ReactNode, ReactElement, useState } from "react";

type ChildProps = {
  children: ReactNode,
}

const List = ({children}: ChildProps) => {
	return (
		<div className="flex flex-col gap-[5px]">
			{children}
		</div>
	);
};

export default List;