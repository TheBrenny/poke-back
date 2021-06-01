# Pokeback
> Win that poke war. Poke them back.

Automatically pokes back other Facebookers that have poked you! Target or ignore specific people as well!

## Installation

```bash
$ npm install -g pokeback
```

## Usage
```
$ pokeback --help
pokeback [username|email] [password]

Create a pokeback instance using an optional username and password

Positionals:
  username, email  The username/email to login with. Can be omitted and entered
                   via STDIN.                                           [string]
  password         The password to login with. Can be omitted and entered via
                   STDIN.                                               [string]

Options:
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
  -i, --ignore   Names of those that you don't wish to poke back.        [array]
  -e, --exactly  Names of that that you ONLY wish to poke back.          [array]
  -t, --timeout  The number of seconds before another poke attempt is made.
                                                           [number] [default: 5]
```

A hidden debug option is also present which allows you to open the chrome head: `--debug`.

## License

GPLv3