import React from 'react';
import { Link } from "react-router-dom";
import Navigator from './NavBar.jsx';
import { useSelector } from 'react-redux';
import { useState, useEffect, createContext } from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import axios from 'axios';
import { useQueryQuery  } from '../services/api/cart.js';


const Cart = () => {
  const cart = useSelector((state) => state.cart.cartid)
  const [cartId] = useState(cart);
  const [lineItems, setlineItems] = useState(null);
  const CartContext = createContext(lineItems);
  const { data, error, isLoading } = useQueryQuery(cartId);
  console.log(data,error,isLoading);

  const getCart = (cartId) => {
    const options = {
      method: 'POST',
      url: `https://${process.env.REACT_APP_SHOPIFY_STORE_URL}/api/2024-04/graphql.json`,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': `${process.env.REACT_APP_SHOPIFY_ACCESS_TOKEN}`,
      },
      data: {
        query: `
              {
                cart(id: "${cartId}") {
                  id
                  totalQuantity
                  checkoutUrl
                  cost {
                    totalAmount {
                      amount
                      currencyCode
                    }
                  }
                  lines(first: 10) {
                    edges {
                      node {
                        merchandise {
                          ... on ProductVariant {
                            id
                            title
                          }
                        }
                        attributes {
                          key
                          value
                        }
                        id
                        quantity
                      }
                    }
                  }
                }
              }
           `
        }
    };
    axios.request(options)
      .then(function (response) {
        setlineItems(response.data.data.cart.lines)   
        console.log(response)
      })
      .catch(function (error) {
        console.error(error);
      });
  };


  useEffect(() => {
    if (cartId) {
      getCart(cartId)     
    }
  }, [cartId]);

  
  
  return (
      <> 
        <Navigator />  
        {lineItems == null ? (
            <div>
            <p>Wow! So empty!</p>
            <Link to="/" >Click here to go back</Link>
            </div>
            ) : (
            <div>
            <CartContext.Provider value={lineItems}>
            {lineItems.edges.map((item) => (
              <div>
               <InputGroup size="lg">
                <Link to={`/product/${item.node.attributes[0].key}`}>
                <img width="200px" src={item.node.attributes[0].value} />
                </Link>
                <h3>{item.node.attributes[0].key}</h3>
                <p>{item.node.merchandise.title}</p>        
                <Button 
                variant="outline-secondary" 
                id="button-addon2"
                aria-label="Increment value"
                // onClick={() => dispatch(decrement())}
                >-</Button>
                <Form.Control disabled placeholder={item.node.quantity}
                              aria-label="Cart Addon"
                              aria-describedby="cart-addon"
                              />
                <Button 
                variant="outline-secondary" 
                id="button-addon2"
                aria-label="Increment value"
                // onClick={() => dispatch(increment())}
                >+</Button>
              </InputGroup>   
        
            </div>
             ))}
            </CartContext.Provider>
            <Link to="/cart"><Button>Checkout</Button></Link>
            </div>
          )}
      </>
    );
  };

export default Cart;