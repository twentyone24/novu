import { JSX } from 'solid-js';
import { useArchiveAll, useArchiveAllRead, useReadAll } from '../../../api';
import { StringLocalizationKey, useInboxContext } from '../../../context';
import { cn, useStyle } from '../../../helpers';
import { Archive, ArchiveRead, ReadAll } from '../../../icons';
import { Dropdown, dropdownItemVariants } from '../../primitives';
import { Localized } from '../../primitives/Localized';

export const MoreActionsOptions = () => {
  const { filter } = useInboxContext();
  const { readAll } = useReadAll();
  const { archiveAll } = useArchiveAll();
  const { archiveAllRead } = useArchiveAllRead();

  return (
    <>
      <ActionsItem
        localizationKey="notifications.actions.readAll"
        onClick={() => readAll({ tags: filter().tags })}
        icon={ReadAll}
      />
      <ActionsItem
        localizationKey="notifications.actions.archiveAll"
        onClick={() => archiveAll({ tags: filter().tags })}
        icon={Archive}
      />
      <ActionsItem
        localizationKey="notifications.actions.archiveRead"
        onClick={() => archiveAllRead({ tags: filter().tags })}
        icon={ArchiveRead}
      />
    </>
  );
};

export const ActionsItem = (props: {
  localizationKey: StringLocalizationKey;
  onClick: () => void;
  icon: () => JSX.Element;
}) => {
  const style = useStyle();

  return (
    <Dropdown.Item
      class={style('moreActions__dropdownItem', cn(dropdownItemVariants(), 'nt-flex nt-gap-2'))}
      onClick={props.onClick}
    >
      <span class={style('moreActions__dropdownItemLeft__icon', 'nt-text-foreground-alpha-600')}>{props.icon()}</span>
      <span class={style('moreActions__dropdownItemLabel')}>
        <Localized localizationKey={props.localizationKey as StringLocalizationKey} />
      </span>
    </Dropdown.Item>
  );
};
