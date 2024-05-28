DROP TABLE IF EXISTS Links;
DROP TABLE IF EXISTS Clicks;

CREATE TABLE Links (
  slug text NOT NULL PRIMARY KEY,
  redirectTo text NOT NULL,
  createdAt integer NOT NULL
);

CREATE TABLE Clicks (
  slug text NOT NULL,
  clicksCount integer NOT NULL,
  date date NOT NULL
);


