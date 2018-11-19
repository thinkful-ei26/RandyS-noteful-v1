'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Reality check', function() {
  it('should be true', function() {
    expect(true).to.be.true;
  });

  it('2 + 2 should equal 4', function () {
    expect(2 + 2).to.equal(4);
  });
});

describe('Express static', function() {
  it('GET request "/" should return the index page', function() {
    return chai.request(app)
      .get('/')
      .then(function (res) {
        expect(res).to.exist;
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });
});

describe('404 handler', function () {
  it('should respond with 404 when given a bad path', function () {
    return chai.request(app)
      .get('/DOES/NOT/EXIST')
      .then(res => {
        expect(res).to.have.status(404);
      });
  });
});

describe('Notes as an array', function () {
  it('GET /api/notes should return default of 10 Notes as an array', function() {
    return chai.request(app)
      .get('/api/notes')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('array');
        const expectedKeys = ['id', 'title', 'content'];
        res.body.forEach(note => {
          expect(note).to.be.a('object');
          expect(note).to.include.keys(expectedKeys);
        });
      });
  });

  it('GET request should return an empty array for an incorrect query', function(){
    return chai.request(app)
    //is it okay that this is hardcoded?
      .get('/api/notes/?searchTerm=trash')
      .then(function(res){
        console.log('RESSSS', res.body);
        expect(res.body).to.be.a('array').that.is.empty;
        // expect(res.body).to.be.empty();
        // expect(res.body.length).to.equal(0);
        //why doesnt this work ^^
      });
  });
}); 

describe('Return a note', function() {
  it('GET /api/notes/:id should return correct note object', function() {
    return chai.request(app)
      .get('/api/notes/1000')
 
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal( {
          'id': 1000,
          'title': '5 life lessons learned from cats',
          'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
        });
      });
  });

  it('GET /api/notes/wrong-id should respond with a 404 for an invalid id', function() {
    return chai.request(app)
      .get('/api/notes/1111')
      .then(function(res) {
        expect(res).to.have.status(404);
      });
  });
});

describe('Create a new note', function() {
  it('POST /api/notes should create an return a new item with location header', function() {
    const newNote = { 
      title: 'note', 
      content: 'content' 
    };

    return chai.request(app)
      .post('/api/notes/')
      .send(newNote)
      .then(function(res) {
        expect(res.body).to.include.keys('id', 'title', 'content');
        expect(res.headers.location).to.have.string('/notes/1010');
      });
  });
  it('POST /api/notes should return an object with a message property "Missing title"', function() {
    const newNote = {  
      content: 'content' 
    };

    return chai.request(app)
      .post('/api/notes/')
      .send(newNote)
      .then(function(res) {
        expect(res.body.message).to.equal('Missing `title` in request body');
      });
  });


});


describe('Update a note', function() {
  it('should update items on PUT', function() {
    const updateData = {
      title: 'Title',
      content: 'Content'
    };
  
    return (
      chai.request(app)
        .get('/api/notes/')
        .then(function(res) {
          updateData.id = res.body[0].id;
          return chai
            .request(app)
            .put(`/api/notes/${updateData.id}`)
            .send(updateData);
        })
        .then(function(res) {
          expect(res.body).to.be.a('object');
          expect(res.body).to.deep.equal(updateData);
        })
    );
  });

  it('should respond with a 404 for an invalid id', function() {
    // const updateData = {
    //   title: 'Title',
    //   content: 'Content'
    // };

    const id = 'not/an/id';
  
    return (
      chai.request(app)
        .get(`/api/notes/${id}`)
        .then(function(res) {
          expect(res).to.have.status(404);
        })
    );
  });

  it('should return an object with message property: missing title', function() {
    const updateData = {
      content: 'Content'
    };
  
    return (
      chai.request(app)
        .get('/api/notes')
        .then(function(res) {
          updateData.id = res.body[0].id;
          // this will return a promise whose value will be the response
          // object, which we can inspect in the next `then` block. Note
          // that we could have used a nested callback here instead of
          // returning a promise and chaining with `then`, but we find
          // this approach cleaner and easier to read and reason about.
          return chai
            .request(app)
            .put(`/api/notes/${updateData.id}`)
            .send(updateData);
        })
      // prove that the PUT request has right status code
      // and returns updated item
        .then(function(res) {
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `title` in request body');
        })
    );
  });
}); 

describe('Delete a note', function() {
  it('should delete a note by id', function() {
    return (
      chai
        .request(app)
        .get('/api/notes/1001')
        .then(function(res) {
          return chai.request(app).delete('/api/notes/1001');
        })
        .then(function(res) {
          expect(res).to.have.status(204);
        })
    );
  });
});