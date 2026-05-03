package com.secureauthlab.repository;

import com.secureauthlab.model.SecuritySettings;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SecuritySettingsRepository extends MongoRepository<SecuritySettings, String> {
}
