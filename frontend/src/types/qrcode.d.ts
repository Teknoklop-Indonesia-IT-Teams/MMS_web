declare module "qrcode" {
  interface QRCodeToDataURLOptions {
    type?: string;
    quality?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
    width?: number;
    scale?: number;
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
    version?: number;
    maskPattern?: number;
  }

  interface QRCodeToFileOptions extends QRCodeToDataURLOptions {
    type?: "png" | "svg";
  }

  interface QRCodeRenderersOptions {
    margin?: number;
    scale?: number;
    width?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }

  function toDataURL(
    text: string,
    options?: QRCodeToDataURLOptions
  ): Promise<string>;
  function toDataURL(
    text: string,
    callback: (error: Error | null, url: string) => void
  ): void;
  function toDataURL(
    text: string,
    options: QRCodeToDataURLOptions,
    callback: (error: Error | null, url: string) => void
  ): void;

  function toFile(
    path: string,
    text: string,
    options?: QRCodeToFileOptions
  ): Promise<void>;
  function toFile(
    path: string,
    text: string,
    callback: (error: Error | null) => void
  ): void;
  function toFile(
    path: string,
    text: string,
    options: QRCodeToFileOptions,
    callback: (error: Error | null) => void
  ): void;

  function toString(
    text: string,
    options?: QRCodeRenderersOptions
  ): Promise<string>;
  function toString(
    text: string,
    callback: (error: Error | null, string: string) => void
  ): void;
  function toString(
    text: string,
    options: QRCodeRenderersOptions,
    callback: (error: Error | null, string: string) => void
  ): void;

  export = {
    toDataURL,
    toFile,
    toString,
  };
}
