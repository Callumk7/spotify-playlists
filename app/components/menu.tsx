import * as Ariakit from "@ariakit/react";
import { cn } from "callum-util";
import { forwardRef } from "react";

export { MenuProvider } from "@ariakit/react";

export const Menu = forwardRef<HTMLDivElement, Ariakit.MenuProps>(
  function Menu(props, ref) {
    const menu = Ariakit.useMenuContext();
    return (
      <Ariakit.Menu
        ref={ref}
        portal
        fitViewport
        unmountOnHide
        overlap={!!menu?.parent}
        gutter={menu?.parent ? 12 : 4}
        shift={menu?.parent ? -9 : -2}
        flip={menu?.parent ? true : "bottom-end"}
        {...props}
        className={cn("menu", props.className)}
      />
    );
  },
);

interface MenuButtonProps extends Ariakit.MenuButtonProps {}

export const MenuButton = forwardRef<HTMLDivElement, MenuButtonProps>(
  function MenuButton(props, ref) {
    const menu = Ariakit.useMenuContext();
    return (
      <Ariakit.MenuButton ref={ref} {...props}>
        <span className="label">{props.children}</span>
        {!!menu?.parent && <Ariakit.MenuButtonArrow />}
      </Ariakit.MenuButton>
    );
  },
);

export const MenuItem = forwardRef<HTMLDivElement, Ariakit.MenuItemProps>(
  function MenuItem(props, ref) {
    return (
      <Ariakit.MenuItem
        ref={ref}
        {...props}
        className={cn("menu-item", props.className)}
      />
    );
  },
);

export const MenuSeparator = forwardRef<
  HTMLHRElement,
  Ariakit.MenuSeparatorProps
>(function MenuSeparator(props, ref) {
  return (
    <Ariakit.MenuSeparator
      ref={ref}
      {...props}
      className={cn("separator", props.className)}
    />
  );
});
