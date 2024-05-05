import Colouriser from './colouriser';

export default class XIDColouriser {
  private static xidColours: Record<string, (text: string) => string> = {};

  public static colouriseXID(xid: string) {
    if (!this.xidColours[xid]) this.xidColours[xid] = Colouriser.getRandomColour();
    return this.xidColours[xid](xid);
  }

  public static deleteXID(xid: string) {
    delete this.xidColours[xid];
  }
}
