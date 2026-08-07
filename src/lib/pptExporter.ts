import PptxGenJS from "pptxgenjs";
import {
  Presentation,
  TextElement,
  ImageElement,
  ShapeElement,
} from "@/types/presentation";

export async function exportPresentation(
  presentation: Presentation
) {
  const ppt = new PptxGenJS();

  ppt.layout = "LAYOUT_WIDE";

  ppt.author = "InsightTube AI";

  ppt.subject = presentation.title;

  ppt.title = presentation.title;

  presentation.slides.forEach((slide) => {

    const s = ppt.addSlide();

    s.background = {
      color: slide.background.value.replace("#",""),
    };

    slide.elements.forEach((element)=>{

      switch(element.type){

        case "text":{

          const text = element as TextElement;

          s.addText(text.text,{
            x:text.x/100,
            y:text.y/100,
            w:text.width/100,
            h:text.height/100,

            fontFace:text.fontFamily,

            fontSize:text.fontSize/2,

            bold:text.fontWeight==="bold",

            color:text.color.replace("#",""),

            align:text.align,
          });

          break;
        }

        case "image":{

          const image = element as ImageElement;

          if(image.src){

            s.addImage({

              path:image.src,

              x:image.x/100,

              y:image.y/100,

              w:image.width/100,

              h:image.height/100

            });

          }

          break;
        }

        case "shape":{

          const shape = element as ShapeElement;

          s.addShape(ppt.ShapeType.rect,{

            x:shape.x/100,

            y:shape.y/100,

            w:shape.width/100,

            h:shape.height/100,

            fill:{
              color:shape.fill.replace("#","")
            },

            line:{
              color:shape.stroke.replace("#",""),
              width:shape.strokeWidth
            }

          });

          break;
        }

      }

    });

  });

  await ppt.writeFile({
    fileName:`${presentation.title}.pptx`
  });

}