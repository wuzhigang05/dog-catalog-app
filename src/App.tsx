import React, { Key } from 'react';
import './App.css';
import {
  Provider, defaultTheme, ActionButton, DialogTrigger, Dialog, Heading,
  useAsyncList, Button, ButtonGroup,
  TableView, TableBody, TableHeader, Image, Row, Column, Cell, Flex,
} from '@adobe/react-spectrum';

import { getUrlForNextPage } from './service';
import { Breed, BreedAttributes, getDisplayNameForAttribute, getValueFromItem } from './data';
import SingleDogRender from './single_dog_render';
import CompareFC from './compare';
let compare_minimum_threshold: number = 2
let compare_maximum_threshold: number = 3
let page: number = 0;

function App() {

  let list = useAsyncList<Breed>({
    async load({ signal, cursor }) {
      // If no cursor is available, then we're loading the first page.
      // Otherwise, the cursor is the next URL to load, as returned from the previous page.
      let url = getUrlForNextPage(page)
      let res = await fetch(cursor || url.toString(), {
        signal
      });

      page += 1
      let json = await res.json();
      return {
        items: json,
        cursor: getUrlForNextPage(page).toString(),
      };
    }
  });

  let columns = [
    BreedAttributes.dogName,
    BreedAttributes.bred_for,
    BreedAttributes.breed_group,
    BreedAttributes.life_span,
    BreedAttributes.temperament,
    BreedAttributes.origin,
  ].map((attribute) => {
    return { name: getDisplayNameForAttribute(attribute), key: attribute }
  })

  function getCell(item: Breed, field: keyof Breed) {
    switch (field) {
      case BreedAttributes.dogName:
        return <Cell>
          <Flex columnGap="size-200" alignItems="center">
            <Flex width="40px" height="40px">
              <Image src={item.image.url} alt={item.name} objectFit="cover" />
            </Flex>
            <DialogTrigger type="fullscreenTakeover">
              <ActionButton alignSelf="start" width={"size-3000"}>
                <Heading level={5}>{item.name}</Heading>
              </ActionButton>
              {(close) => (
                <Dialog>
                  <SingleDogRender item={item} ></SingleDogRender>
                  <ButtonGroup>
                    <Button variant="cta" onPress={close} autoFocus>
                      Done
                    </Button>
                  </ButtonGroup>
                </Dialog>
              )}
            </DialogTrigger>
          </Flex></Cell >;
      case BreedAttributes.weight:
      case BreedAttributes.height:
      case BreedAttributes.bred_for:
      case BreedAttributes.breed_group:
      case BreedAttributes.life_span:
      case BreedAttributes.temperament:
      case BreedAttributes.origin:
        return <Cell>{getValueFromItem(item, field)}</Cell>;
      default:
        throw Error("Unhandled attribute: " + { field });
    }
  }

  // Spent lots of time trying to resolve a compilation error. Need to add
  // <'all' | Iterable<Key>> to useState.
  let [selectedKeys, setSelectedKeys] = React.useState<'all' | Iterable<string>>(new Set([]));

  function handleSelectedKeys(keys: 'all' | Iterable<Key>) {
    if (keys === 'all') {
      setSelectedKeys(new Set(list.items.map(item => item.name)))
    } else {
      setSelectedKeys(new Set((keys as Iterable<string>)));
    }
  }

  return (
    <Provider theme={defaultTheme}>
      <div className="heading">
        <Flex justifyContent="center"><Heading level={1}>Welcome to Dogs Home</Heading></Flex>
      </div>
      <div className="dogs-container">
        <DialogTrigger type="fullscreenTakeover">
          {/* Disable the compare button if no entities are selected or too many (>=4) are selected */}
          <Flex gap={"size-100"} alignItems={"center"} margin="size-200">
            <Button variant="cta" alignSelf="start" marginTop={"4px"}
              isDisabled={selectedKeys === 'all' ||
                ((selectedKeys as Set<Key>).size < compare_minimum_threshold) ||
                ((selectedKeys as Set<Key>).size > compare_maximum_threshold)}>Compare</Button>

            {selectedKeys === 'all' ||
              ((selectedKeys as Set<Key>).size < compare_minimum_threshold) ||
              ((selectedKeys as Set<Key>).size > compare_maximum_threshold) ?
              <p className="compare-instruction">Select {compare_minimum_threshold} - {compare_maximum_threshold} Dogs to compare</p> :
              null}
          </Flex>
          {(close) => (
            <Dialog>
              <CompareFC items={selectedKeys === 'all' ?
                list.items :
                list.items.filter(item => (selectedKeys as Set<Key>).has(item.name))} />
              <ButtonGroup>
                <Button variant="cta" onPress={close} autoFocus>
                  Done
                </Button>
              </ButtonGroup>
            </Dialog>
          )}
        </DialogTrigger>


        <TableView aria-label="example async loading table" height="1080px"
          overflowMode="wrap"
          selectionMode="multiple"
          selectedKeys={selectedKeys}
          onSelectionChange={handleSelectedKeys}>
          <TableHeader columns={columns}>
            {(column) => (
              <Column align={column.key !== 'name' ? 'end' : 'start'}>
                {column.name}
              </Column>
            )}
          </TableHeader>
          <TableBody
            items={list.items}
            loadingState={list.loadingState}
            onLoadMore={list.loadMore}>
            {(item) => (
              <Row key={item.name}>{(key) => getCell(item, key as keyof Breed)}
              </Row>
            )}
          </TableBody>
        </TableView>
      </div>
    </Provider>
  );
}

export default App;

