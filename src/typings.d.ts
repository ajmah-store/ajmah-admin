//import "chart.js";

declare class Croppie {
    constructor(container: HTMLElement, options?: Croppie.CroppieOptions);

    bind(options: {
        url: string,
        points?: number[],
        orientation?: number,
        zoom?: number,
        useCanvas?: boolean,
    }): Promise<void>;

    result(options: Croppie.ResultOptions & { type: 'base64' | 'canvas' }): Promise<string>;
    result(options: Croppie.ResultOptions & { type: 'html' }): Promise<HTMLElement>;
    result(options: Croppie.ResultOptions & { type: 'blob' }): Promise<Blob>;
    result(options: Croppie.ResultOptions & { type: 'rawcanvas' }): Promise<HTMLCanvasElement>;
    result(options?: Croppie.ResultOptions): Promise<HTMLCanvasElement>;

    get(): Croppie.CropData;

    rotate(degrees: number): void;

    setZoom(zoom: number): void;

    destroy(): void;

    refresh(): void;
}

declare namespace Croppie {
    type CropType = 'square' | 'circle';

    type Format = 'jpeg' | 'png' | 'webp';

    type Type = 'canvas' | 'base64' | 'html' | 'blob' | 'rawcanvas';

    interface ResultOptions {
        type?: Type;
        size?: 'viewport' | 'original' | { width: number, height: number };
        format?: Format;
        quality?: number;
        circle?: boolean;
    }

    interface CroppieOptions {
        boundary?: { width: number, height: number };
        customClass?: string;
        enableExif?: boolean;
        enableOrientation?: boolean;
        enableZoom?: boolean;
        enforceBoundary?: boolean;
        mouseWheelZoom?: boolean|'ctrl';
        showZoomer?: boolean;
        viewport?: { width: number, height: number, type?: CropType };
        update?:() => void;
    }

    interface CropData {
        points?: number[];
        orientation?: number;
        zoom?: number;
    }
}
