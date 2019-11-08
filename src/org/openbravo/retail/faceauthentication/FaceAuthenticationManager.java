package org.openbravo.retail.faceauthentication;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.Header;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.HttpClients;
import org.hibernate.criterion.Restrictions;
import org.openbravo.authentication.AuthenticationException;
import org.openbravo.authentication.basic.DefaultAuthenticationManager;
import org.openbravo.base.exception.OBException;
import org.openbravo.base.secureApp.VariablesSecureApp;
import org.openbravo.dal.service.OBCriteria;
import org.openbravo.dal.service.OBDal;
import org.openbravo.erpCommon.utility.OBError;
import org.openbravo.model.ad.access.User;

public class FaceAuthenticationManager extends DefaultAuthenticationManager {

  @Override
  protected String doAuthenticate(HttpServletRequest request, HttpServletResponse response)
      throws AuthenticationException, ServletException, IOException {

    final VariablesSecureApp vars = new VariablesSecureApp(request, false);

    String userName = vars.getStringParameter(LOGIN_PARAM);

    if (userName != null) {
      return super.doAuthenticate(request, response);
    }

    String image = request.getHeader("image");

    HttpClient httpClient = HttpClients.createDefault();
    HttpPost httpPost = new HttpPost("http://localhost:3000");

    httpPost.addHeader("image", image);
    HttpResponse nodeResponse = httpClient.execute(httpPost);

    Header[] headers = nodeResponse.getAllHeaders();
    boolean success = Boolean.getBoolean(headers[0].getValue());
    if (success) {
      String user = headers[1].getValue();
      OBCriteria<User> userCriteria = OBDal.getInstance().createCriteria(User.class);
      userCriteria.add(Restrictions.eq("name", user));
      User dalUser = (User) userCriteria.uniqueResult();

      if (dalUser == null) {
        throw new OBException("No user found: " + user);
      }
      String userId = dalUser.getId();

      final String sessionId = createDBSession(request, user, userId);

      vars.setSessionValue("#AD_User_ID", userId);

      // Using the Servlet API instead of vars.setSessionValue to avoid breaking code
      // vars.setSessionValue always transform the key to upper-case
      request.getSession(true).setAttribute("#Authenticated_user", userId);

      vars.setSessionValue("#AD_SESSION_ID", sessionId);
      vars.setSessionValue("#LogginIn", "Y");

      return userId;

    } else {
      OBError errorMsg = new OBError();
      errorMsg.setType("Error");
      errorMsg.setTitle("User not recognised");
      errorMsg.setMessage("User is not recognised. Please use standard authentication.");
      throw new AuthenticationException("IDENTIFICATION_FAILURE_TITLE", errorMsg, false);
    }

  }

}
