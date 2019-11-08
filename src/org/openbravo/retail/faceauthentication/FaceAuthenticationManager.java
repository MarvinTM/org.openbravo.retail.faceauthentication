package org.openbravo.retail.faceauthentication;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.openbravo.authentication.AuthenticationException;
import org.openbravo.authentication.basic.DefaultAuthenticationManager;

public class FaceAuthenticationManager extends DefaultAuthenticationManager {

  @Override
  protected String doAuthenticate(HttpServletRequest request, HttpServletResponse response)
      throws AuthenticationException, ServletException, IOException {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  protected void doLogout(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    // TODO Auto-generated method stub

  }

}
