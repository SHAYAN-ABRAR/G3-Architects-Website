# Architectural concept imagery

These five images were generated specifically for the G3 Architects redesign on 7 October 2026 with the built-in image-generation tool. They were exported to responsive WebP files using proportional resizing and format compression. The generated scenes were not composited from real project photographs.

| Asset | Imagined subject | Export widths |
| --- | --- | --- |
| `courtyard-*.webp` | Lime-plaster and terracotta courtyard residence | 640, 1672 px |
| `interior-*.webp` | Restrained limewash, walnut and travertine apartment | 480, 1086 px |
| `pavilion-*.webp` | Open timber reading pavilion in a park | 640, 1448 px |
| `brick-*.webp` | Adaptive-reuse brick warehouse workspace | 640, 1448 px |
| `atelier-*.webp` | Architect's workbench with a basswood model and material samples | 640, 1672 px |

All project names, design studies and architecture are fictional. The images do not document completed commissions or certify structural or environmental performance. This is disclosed on the website.

The exact generation prompts are in [prompts.json](prompts.json). Generation used the built-in tool, not a command-line substitute or an external image service. No source reference images were supplied.

The original PNGs were converted to WebP at quality 86 for the site. HTML `srcset`, lazy loading below the hero and explicit image dimensions help limit transfer size and layout shifts. The hero is prioritised; the site does not generate images at runtime.
