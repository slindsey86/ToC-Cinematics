import { boot } from './boot';

import { Texture } from '@pixi/core';
import { Sprite } from '@pixi/sprite';

import { Container, DisplayObject } from '@pixi/display';
import { BLEND_MODES } from '@pixi/constants';
import { InteractionManager } from '@pixi/interaction';
import { Text } from '@pixi/text';

import gsap from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';


export const app = boot();
PixiPlugin.registerPIXI({ DisplayObject });
gsap.registerPlugin(PixiPlugin);

const __window__ = window as any;

const T = `
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAARCAMAAAB9y9tWAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAh9QTFRFAAAA////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////5JjstAAAALV0Uk5TAAECAwQHCQoIBgULEBUYFxYUExIRDw4NDBkjLDQzMjEwLy4tKykoJyUkISAeHRsaHD9RXVxaWFZUU09MSkhFQ0E+PDk3KiYiXniJh4WCgH17dnJua2djYE1JRkI7ODWasK6qp6ShnZeSjYRtaFlLR2zF4d7a1tLOysbBu7aemIyGf3lzYVdSOjZxotDt6ubd2dTLv7mzrKagk3o9QGbTz8fDsaublZCKYpajmY6BfG9qZU4fVbJlZ2YAAALVSURBVHiclZQJQxJBGIZZYLlXWG52AUVOQRAIFY9CTUXMTC3NTMXMzCM1Lbu0svDI7NTyqOwus9OiH9jMLoeiZj0/4Jl3vnfmYzAACMJkpcKMgWyF8S8wWWyUw43DgfB4KIry+XwBgA1JnrK3GGGhQhGWRiEWSyQYjkulMrlcpFAolSqVWi0Ucukj4AGUOyHe2cdTaAhSC9Hp0zMMmUbSZLZYbVmE3ZHtdOVoxOAMGfArVWqgjot3C4ww+Qo36fHug/hy8/L9Bd7CouL9BwIlpWUHy7V6g7HCUpkVdGS7ctIkmFQmintjcTdPmhKyOZi5pCpUDTlUc7j2SF2ovuHoscam4748v7f5RMvJ0ta2dr3BZLER9my3RoxJ5UAqpKKmJKUaEQhdWn8o3AE51Xm660x3+GxPb3VfbV19Q/+5pqoBf+HgUMDTWq4zkOZKwuEEQXGQU82Fc+ULYo3FnFCoJALnw8MjkAsXRy9dvnL12th4R2fX9Rs9Nydu3Y70N076pqab9wdKZ+7ojWYbFROXKRI3Z2++OQOM0DY0e3fuHuT+g5GHjx7PzQ8vPHm6uLQcXumdqH1GGfO9gy0lz9u0GaSVAONMk0h3miUtVAZfrPaMjUJevpp//WZhbPztu6Xl9x8+rvVRAT8lAuoMJmuWw+nSSHD5bgkRttClm65fX4R0Ln1e7v6yvvJ1rebb91Dkx8bPSV9ewa9iUAy4biboJRilawG6xAypCSZbZvFwqyc30gehO47M9m+sgpIHfnuBC/QBS4aF2KPunHjJXN4u7xxhClQac2vRFCTfP+0tbKZfoadspq1dl55JVljBe4mCe4J2oQzcdNPotr9D8PNUWNRihJCkqcJssVgrbUTQ7og63cAixnBp8p9w6GApybasDmDkcxW4hALD6J8MDKLkT+YmfnLs1W3bQim/mckSoLw4KEovmsSm2XGb/XV9If+xD/cU/gFDoq1duqV8UwAAAABJRU5ErkJggg==
`;

async function main() {
  // nullTest();
  // jjj();

  function addRay() {
    const s = new Sprite(Texture.from(T));
    app.stage.addChild(s);
    s.scale.set(7, 5);
    s.position.set(300, 300);
    s.anchor.set(0.1, 0.5);

    s.rotation = Math.random() * Math.PI * 2.0;

    gsap.fromTo(
      s,
      {
        pixi: {
          alpha: 0,
        },
      },
      {
        pixi: {
          alpha: 1,
          scaleX: 0.5,
        },
        duration: 0.75,
        ease: 'power4.int',
        onComplete: () => {
          s.destroy();
        },
      }
    );
  }

  setInterval(addRay, 10);

  // addRay()
}

main().catch(console.error);
