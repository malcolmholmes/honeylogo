package main

import (
	"context"
	_ "embed"
	"os"
	"strings"

	"gitlab.com/malcolmholmes/victor/pkg/config"
	"gitlab.com/malcolmholmes/victor/pkg/db"
	"gitlab.com/malcolmholmes/victor/pkg/server"
)

//go:embed victor.yaml
var victorConfig string

func main() {
	conf := config.NewConfig()
	conf.WithConfigString(server.DefaultConfig())
	conf.WithConfigString(victorConfig)

	ctx := context.Background()
	c := os.Getenv("CONFIGS")
	if c != "" {
		configFiles := strings.Split(c, ",")
		for _, configFile := range configFiles {
			conf.WithConfigFile(configFile)
		}
	}
	conf.WithEnv("site.base-domain", "DOMAIN")
	conf.WithEnv("git.branch", "BRANCH")

	conf.WithDataTypes([]db.DatabaseResource{
		&db.User{},
		&db.HttpSession{},
		&db.AccessToken{},
	})

	s := server.NewServer(conf)

	err := s.Start(ctx)
	if err != nil {
		panic(err)
	}
}
