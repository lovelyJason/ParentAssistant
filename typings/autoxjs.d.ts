export interface Device {
  width: number;
  height: number;
}

declare global {
  var device: Device
}