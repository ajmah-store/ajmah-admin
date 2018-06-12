export class Alert {
  type: number = 1;
  title: string;
  content: string;
}

export const ALERT_TYPES = {
  INFO: 1,
  SUCCESS: 2,
  WARN: 3,
  DANGER: 4
};
