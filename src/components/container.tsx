
import { PropsWithChildren } from "react";

type ContainerProps = PropsWithChildren;

export default function Container({ children }: ContainerProps) {
  return (
    <div className="mx-auto w-full px-4 sm:px-8">
      {children}
    </div>
  );
}