package com.example.Quora.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public List<String> uploadImages(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return List.of();
        }

        return files.stream()
                .filter(file -> file != null && !file.isEmpty())
                .map(file -> uploadImage(file, "askverse/questions"))
                .toList();
    }

    public String uploadProfileImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        return uploadImage(file, "askverse/profiles");
    }

    private String uploadImage(MultipartFile file, String folder) {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "image"
                    )
            );
            Object secureUrl = result.get("secure_url");
            if (secureUrl == null) {
                throw new IllegalStateException("Cloudinary upload did not return a secure URL");
            }
            return secureUrl.toString();
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to upload image to Cloudinary", exception);
        }
    }
}
