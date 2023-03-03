import React, { ReactNode, ReactElement, useState } from "react";

type ChildProps = {
  children: ReactNode,
}

const List = ({children}: ChildProps) => {
	return (
		<div>
			{children}
		</div>
	);
};

export default List;