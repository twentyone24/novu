'use-client';

export type SidebarItemProps = {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  external?: boolean;
  children?: React.ReactNode;
};

export const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  isActive = false,
  external = false,
  children,
}) => {
  return (
    <div
      className={
        `flex items-center space-x-4 p-2 font-medium rounded-md hover:bg-gray-100 cursor-pointer ` +
        `${isActive ? 'bg-gray-100' : ''}`
      }
      style={{ height: '30px', padding: '4px 0', color: '#37352fa6' }}
    >
      <div className="w-4 h-4">
        <div className="w-4 h-4 overflow-hidden mr-2">
          <Icon className="w-full h-full object-cover" />
        </div>
      </div>
      <span className={`text-sm ${isActive ? 'text-gray-900' : 'text-gray-800'}`}>{label}</span>
      {children}
    </div>
  );
};
