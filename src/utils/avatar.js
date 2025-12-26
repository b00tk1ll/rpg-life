import { minidenticon } from 'minidenticons'

export const generateAvatar = (name) => {
    // Generate SVG string using minidenticons
    // 95 opacity, 50 lightness (default is usually good)
    const svgContent = minidenticon(name, 95, 50)

    // Convert to Data URI
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`
}
