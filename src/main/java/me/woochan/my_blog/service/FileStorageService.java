package me.woochan.my_blog.service;

import me.woochan.my_blog.dto.UploadResponse;

public interface FileStorageService {
    UploadResponse store(byte[] bytes, String filename);
}
