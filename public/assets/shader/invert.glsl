#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D uMainSampler;
varying vec2 outTexCoord;

void main()
{
    vec4 color = texture2D(uMainSampler, outTexCoord);
    gl_FragColor = vec4(vec3(1.0) - color.rgb, color.a);
}
