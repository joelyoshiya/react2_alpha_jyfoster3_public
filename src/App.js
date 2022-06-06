import React from 'react';
import './App.css';
import Sidebar from './Sidebar';
import CourseArea from './CourseArea';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allCourses: [],
      filteredCourses: [],
      subjects: [],
      cartCourses: {},
      completedCourses: [],
      uniqueKeywords: [],
      recommendedCourses: []
    };
  }



  componentDidMount() {
   this.loadInitialState()
  }

  async loadInitialState(){
    let courseURL = "http://mysqlcs639.cs.wisc.edu:53706/api/react/classes";
    let courseCompleteURL = "http://mysqlcs639.cs.wisc.edu:53706/api/react/students/5022025924/classes/completed";
    let courseData = await (await fetch(courseURL)).json()
    let courseCompleteData = await (await fetch(courseCompleteURL)).json()




    this.setState({allCourses: courseData, filteredCourses: courseData, subjects: this.getSubjects(courseData), completedCourses: this.getCompleteCourse(courseCompleteData, courseData), uniqueKeywords: this.getKeywords(courseData)});
  }

  getCompleteCourse(courseCompleteData, courseData){
    let completeCourses = [];
    //data is courseComplete data
    for(const courseNum of courseCompleteData.data){
      for(const course of Object.values(courseData)){
        if(courseNum === course.number){
            
            course.rating = 0;
            completeCourses.push(course);
        }
      }
    }
    return completeCourses;
  }

  //Input:
  //  -user ratings for courses taken prior
  //  -keywords for courses taken prior
  //  -uniquekeywords
  //  -all courses
  //Output: 
  //  -an array of course objects that are recommended
  getRecommendations(completedCourses){
    let recCourses = [];
  
    //courses that pass a rating threshold
    let ratingThreshCourses = [];
    for(const course of completedCourses){
        if(course.rating >= 4){
          ratingThreshCourses.push(course);
        }
    }
    let ratingTreshCourseKeywords = this.getKeywords(ratingThreshCourses);

    for(const course in this.state.allCourses){
      if(course.number in this.state.completedCourses){
        continue;
      }else{
        for(const course of this.state.allCourses){
          for(const keyword of ratingTreshCourseKeywords){
            for(const courseKeyword of course.keywords){
              if(keyword === courseKeyword){
                recCourses.push(course);
                break;
              }
            }
          }
        }
      }
    }
    console.log(recCourses);
    return recCourses;
  }

  updateRatings = (courseNum, newRating) => {
    let newCompCourses = JSON.parse(JSON.stringify(this.state.completedCourses));

      for(let compCourse of newCompCourses){
        if(courseNum == compCourse.number){
          compCourse.rating = newRating;
        }
      }
    this.setState({completedCourses: newCompCourses});
    this.setState({recommendedCourses: this.getRecommendations(newCompCourses)});
  }

  getSubjects(data) {
    let subjects = [];
    subjects.push("All");

    for(let i = 0; i < data.length; i++) {
      if(subjects.indexOf(data[i].subject) === -1)
        subjects.push(data[i].subject);
    }

    return subjects;
  }

  getKeywords(data){
    let keyWords = [];
    keyWords.push("none");

    for(let i = 0; i < data.length; i++){
      for(let j = 0; j < data[i].keywords.length; j++){
        if(keyWords.indexOf(data[i].keywords[j]) == -1){
            keyWords.push(data[i].keywords[j]);
        }
      }
    }
    return keyWords;
  }

  setCourses(courses) {
    this.setState({filteredCourses: courses})
  }

  addCartCourse(data) {
    let newCartCourses = JSON.parse(JSON.stringify(this.state.cartCourses))// I think this is a hack to deepcopy
    let courseIndex = this.state.allCourses.findIndex((x) => {return x.number===data.course})
    if (courseIndex === -1)
    {
      return 
    }

    if('subsection' in data) {
      if(data.course in this.state.cartCourses) {
        if(data.section in this.state.cartCourses[data.course]) {
          newCartCourses[data.course][data.section].push(data.subsection);
        }
        else {
          newCartCourses[data.course][data.section] = [];
          newCartCourses[data.course][data.section].push(data.subsection);
        }
      }
      else {
        newCartCourses[data.course] = {};
        newCartCourses[data.course][data.section] = [];
        newCartCourses[data.course][data.section].push(data.subsection);
      }
    }
    else if('section' in data) {
      if(data.course in this.state.cartCourses) {
        newCartCourses[data.course][data.section] = [];

        for(let i = 0; i < this.state.allCourses[courseIndex].sections[data.section].subsections.length; i++) {
          newCartCourses[data.course][data.section].push(this.state.allCourses[courseIndex].sections[data.section].subsections[i]);
        }
      
      
      }
      else {
        newCartCourses[data.course] = {};
        newCartCourses[data.course][data.section] = [];
        for(let i = 0; i < this.state.allCourses[courseIndex].sections[data.section].subsections.length; i++) { 
          newCartCourses[data.course][data.section].push(this.state.allCourses[courseIndex].sections[data.section].subsections[i]);
        }
      }
    }
    else {
      newCartCourses[data.course] = {};


      for (let i = 0; i < this.state.allCourses[courseIndex].sections.length; i++){
        newCartCourses[data.course][i] = [];

         for(let c= 0; c < this.state.allCourses[courseIndex].sections[i].subsections.length; c ++){
          newCartCourses[data.course][i].push(this.state.allCourses[courseIndex].sections[i].subsections[c]);
        }

      }


    }
    this.setState({cartCourses: newCartCourses});
  }

  removeCartCourse(data) {
    let newCartCourses = JSON.parse(JSON.stringify(this.state.cartCourses))

    if('subsection' in data) {
      newCartCourses[data.course][data.section].splice(newCartCourses[data.course][data.section].indexOf(data.subsection), 1);
      if(newCartCourses[data.course][data.section].length === 0) {
        delete newCartCourses[data.course][data.section];
      }
      if(Object.keys(newCartCourses[data.course]).length === 0) {
        delete newCartCourses[data.course];
      }
    }
    else if('section' in data) {
      delete newCartCourses[data.course][data.section];
      if(Object.keys(newCartCourses[data.course]).length === 0) {
        delete newCartCourses[data.course];
      }
    }
    else {
      delete newCartCourses[data.course];
    }
    this.setState({cartCourses: newCartCourses});
  }

  getCartData() {
    let cartData = [];

    for(const courseKey of Object.keys(this.state.cartCourses)) {
      let course = this.state.allCourses.find((x) => {return x.number === courseKey})

      cartData.push(course);
    }
    return cartData;
  }

  render() {

    return (
      <>
        <link
          rel="stylesheet"
          href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
          integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
          crossOrigin="anonymous"
        />

        <Tabs defaultActiveKey="search" style={{position: 'fixed', zIndex: 1, width: '100%', backgroundColor: 'white'}}>
          <Tab eventKey="search" title="Search" style={{paddingTop: '5vh'}}>
            <Sidebar setCourses={(courses) => this.setCourses(courses)} courses={this.state.allCourses} subjects={this.state.subjects} uniqueKeywords={this.state.uniqueKeywords}/>
            <div style={{marginLeft: '20vw'}}>
              <CourseArea data={this.state.filteredCourses} addCartCourse={(data) => this.addCartCourse(data)} removeCartCourse={(data) => this.removeCartCourse(data)} cartCourses={this.state.cartCourses} compCourse={false} recCourse={false}/>
            </div>
          </Tab>
          <Tab eventKey="cart" title="Cart" style={{paddingTop: '5vh'}}>
            <div style={{marginLeft: '20vw'}}>
              <CourseArea data={this.getCartData()} addCartCourse={(data) => this.addCartCourse(data)} removeCartCourse={(data) => this.removeCartCourse(data)} cartCourses={this.state.cartCourses} compCourse={false} recCourse={false}/>
            </div>
          </Tab>
          <Tab eventKey="completed" title="Completed Coursework" style={{paddingTop: '5vh'}}>
            <div style={{marginLeft: '20vw'}}>
            <CourseArea data={this.state.completedCourses} addCartCourse={(data) => this.addCartCourse(data)} removeCartCourse={(data) => this.removeCartCourse(data)} cartCourses={this.state.cartCourses} compCourse={true} updateRatings={this.updateRatings} getRecommendations={this.getRecommendations} recCourse={false}/>
            </div>
          </Tab>
          <Tab eventKey="recommended" title="Recommended Courses" style={{paddingTop: '5vh'}}>
            <div style={{marginLeft: '20vw'}}>
            <CourseArea data={this.state.recommendedCourses} addCartCourse={(data) => this.addCartCourse(data)} removeCartCourse={(data) => this.removeCartCourse(data)} cartCourses={this.state.cartCourses} compCourse={true} getRecommendations={this.getRecommendations} updateRatings={this.updateRatings} recCourse={true}/>
            </div>
          </Tab>
        </Tabs>
      </>
    )
  }
}

export default App;
