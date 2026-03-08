
  // === SHADERS ===
    export const starVertexShader = `
      precision highp float;

      uniform float size;
      attribute vec3 acolor;
      attribute float aSize; // размер каждой точки
      varying vec3 vColor;

      void main() {
        vColor = acolor;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * (200.0 / max(1.0, -mvPosition.z));
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    export const starFragmentShader = `
      precision mediump float;

      varying vec3 vColor;

      void main() {
        vec2 cxy = 2.0 * gl_PointCoord - 1.0;
        float r = dot(cxy, cxy);
        if (r > 1.0) discard;

        // добавление лучей
        float angle = atan(cxy.y, cxy.x);
        float spikes = abs(sin(angle * 10.0)) * 0.3;

        // базовое свечение
        float strength = 1.0 - r * r;    // для более мягкого градиента к краю
        strength += spikes;
        float multiplier = 0.7;
        
        gl_FragColor = vec4(vColor * strength * multiplier, strength * multiplier); // strength как альфа-канал для более мягкого края
      }
    `;


