import React from 'react';
import CompCourse from './CompCourse';
import Form from 'react-bootstrap/Form';

class Rating extends React.Component {

    //TODO Make some way for ratings to be recognized
    constructor() {
        super();
        this.userRating = React.createRef();
    }


    



    render(){
        return( 
        
            <Form>
                <Form.Group controlId="userRating" onChange={(courseName, rating) => this.props.updateRatings(this.props.courseNum,this.userRating.current.value)}>
                <Form.Label>Your Rating</Form.Label>
                <Form.Control
                    as="select"
                    ref={this.userRating}
                >
                    <option value="No Rating">No rating</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>

                </Form.Control>
                </Form.Group>
            </Form>
            
            
            )
    }

}
export default Rating;