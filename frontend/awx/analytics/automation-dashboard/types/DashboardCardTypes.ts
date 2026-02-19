type DashboardCommonCardProps = {
  id: string;
  title: string;
  help?: string;
};

export type DashboardValueCardProps = DashboardCommonCardProps & {
  value: string | number;
  valueSuffix?: string;
  linkText?: string;
  to?: string;
};
