import { Breed, exposedBreedAttributes } from './data'
import {
    Flex, Image,
} from '@adobe/react-spectrum';

interface SingleDogRenderProp {
    item: Breed
}

interface FixedWidthRowProps {
    width?: string
    children: React.ReactNode
}

const FixedWidthRow: React.FunctionComponent<FixedWidthRowProps> = ({ width, children }:
    FixedWidthRowProps) => {
    return (
        <Flex width={width == null ? "size-6000" : width}>{children}</Flex>
    )
}

function getValueFromItem(item: Breed, attribute: string) {
    switch (attribute) {
        case 'image':
            return item.image.url
        case 'weight':
            return item.weight.metric
        case 'height':
            return item.height.metric
        case 'name':
            return item.name
        case 'bred_for':
            return item.bred_for
        case 'breed_group':
            return item.breed_group
        case 'origin':
            return item.origin
        case 'temperament':
            return item.temperament
        case 'life_span':
            return item.life_span
        default:
            return 'Not Available'
    }
}
function SingleDogRender({ item }: SingleDogRenderProp) {
    return (
        <Flex margin="size-1000" margin-left="size-2000" direction="column" width="size-6000">
            {exposedBreedAttributes.map((attribute) => {
                switch (attribute) {
                    case 'image':
                        return <FixedWidthRow width="size-6000"><Image src={item.image.url} alt={item.name} />
                        </FixedWidthRow>;
                    default:
                        return <FixedWidthRow width="size-6000">
                            <Flex columnGap="size-200" alignItems="center">
                                <FixedWidthRow width="size-2000"><h3>{attribute}</h3></FixedWidthRow>
                                <FixedWidthRow width="size-6000">{getValueFromItem(item, attribute)}</FixedWidthRow>
                            </Flex>
                        </FixedWidthRow>
                }
            })}



        </Flex>
    )
}

export default SingleDogRender