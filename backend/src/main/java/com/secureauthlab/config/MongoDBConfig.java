package com.secureauthlab.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoDatabase;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;

@Configuration
public class MongoDBConfig {

    @Autowired
    private MongoClient mongoClient;

    @Bean
    public MongoTemplate sampleMflixTemplate() {
        return new MongoTemplate(mongoClient, "sample_mflix");
    }
}
