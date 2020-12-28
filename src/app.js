const express = require("express");
const cors = require("cors");
//const { uuid, isUuid } = require('uuidv4');

const { v4: uuid, validate: isUuid } = require('uuid'); //ver depois**

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function validateProjectId(request, response, next) {
    const { id } = request.params;

    if(!isUuid(id)) {
        return response.status(400).json({ error: 'Invalid project ID.' });
    }

    return next();
}

app.use('/repositories/:id', validateProjectId); 
//app.use('/repositories/:id/like', validateProjectId); //aplicando o middleware so nas rotas q eu quero (put e delete)

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const project = { id: uuid(), title, url, techs, likes: 0 }; //ver assim carrega like

  repositories.push(project);

  return response.json(project);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const repositoryIndex = repositories.findIndex(r => r.id === id);

   if(repositoryIndex < 0) {
       return response.status(400).json({ error: 'Repository not found.' })
   }
    
  const repository = {
      id,
      title,
      url, 
      techs, 
      likes: repositories[repositoryIndex].likes,
  };

  repositories[repositoryIndex] = repository;

  return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(r => r.id === id);

  if(repositoryIndex < 0) {
      return response.status(400).json({ error: 'Project not found.' })
  }

  repositories.splice(repositoryIndex, 1); //remover apenas a essa posição então 1

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repository = repositories.find(repository => repository.id === id);

  if(!repository) { //não existe
      return response.status(400).send(); 
  }
    
  repository.likes += 1;

  return response.json(repository);
});

module.exports = app;
//yarn test --watchAll